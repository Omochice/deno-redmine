{
  description = "Redmine REST-API wrapper library for deno";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nur = {
      url = "github:Omochice/nur-packages";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      treefmt-nix,
      flake-utils,
      git-hooks,
      nur,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ nur.overlays.default ];
        };
        treefmt = treefmt-nix.lib.evalModule pkgs (
          { ... }:
          {
            settings.global.excludes = [
              "CHANGELOG.md"
            ];
            programs = {
              # keep-sorted start block=yes
              deno = {
                enable = true;
                includes = [
                  "*.ts"
                ];
              };
              formatjson5 = {
                enable = true;
                indent = 2;
              };
              keep-sorted.enable = true;
              mdformat.enable = true;
              nixfmt.enable = true;
              typos.enable = true;
              yamlfmt = {
                enable = true;
                settings = {
                  formatter = {
                    type = "basic";
                    retain_line_breaks_single = true;
                  };
                };
              };
            };
            # keep-sorted end
          }
        );
        gitHooks = git-hooks.lib.${system}.run {
          src = self;
          default_stages = [
            "pre-commit"
            "pre-push"
          ];
          hooks = {
            treefmt = {
              enable = true;
              packageOverrides.treefmt = treefmt.config.build.wrapper;
              stages = [ "pre-commit" ];
              # formatjson5 rewrites files unconditionally, updating their mtime
              # even when the content is unchanged, which trips treefmt's
              # mtime-based --fail-on-change. Let treefmt only format and rely on
              # pre-commit's own content-based change detection to block commits.
              settings.fail-on-change = false;
            };
            denolint = {
              enable = true;
              package = pkgs.deno;
              stages = [ "pre-commit" ];
            };
            deno-check = {
              enable = true;
              name = "deno check";
              entry = "${pkgs.deno}/bin/deno check ./**/*.ts";
              files = "\\.ts$";
              pass_filenames = false;
              stages = [ "pre-push" ];
            };
          };
        };
        runAs =
          name: runtimeInputs: text:
          let
            program = pkgs.writeShellApplication {
              inherit name runtimeInputs text;
            };
          in
          {
            type = "app";
            program = "${program}/bin/${name}";
          };
        devPackages = rec {
          # keep-sorted start block=yes
          actions = [
            pkgs.actionlint
            pkgs.ghalint
            pkgs.zizmor
          ];
          deno = [ pkgs.deno ];
          renovate = [
            pkgs.renovate
          ];
          # keep-sorted end
          default = actions ++ deno ++ renovate ++ [ treefmt.config.build.wrapper ];
        };
      in
      {
        # keep-sorted start block=yes
        apps = {
          check-actions = pkgs.lib.pipe ''
            actionlint
            ghalint run
            zizmor ./.github/workflows
          '' [ (runAs "check-actions" devPackages.actions) ];
          check-renovate-config = pkgs.lib.pipe ''
            renovate-config-validator renovate.json5 --strict
          '' [ (runAs "check-renovate-config" devPackages.renovate) ];
          check-deno = pkgs.lib.pipe ''
            deno task check
            deno task lint
            deno task test
          '' [ (runAs "check-deno" devPackages.deno) ];
          test-coverage = pkgs.lib.pipe ''
            deno task test:coverage
          '' [ (runAs "test-coverage" devPackages.deno) ];
        };
        checks = {
          formatting = treefmt.config.build.check self;
          git-hooks = gitHooks;
        };
        devShells = pkgs.lib.pipe devPackages [
          (pkgs.lib.attrsets.mapAttrs (name: buildInputs: pkgs.mkShell { inherit buildInputs; }))
          (
            shells:
            shells
            // {
              default = pkgs.mkShell {
                buildInputs = devPackages.default ++ gitHooks.enabledPackages;
                inherit (gitHooks) shellHook;
              };
            }
          )
        ];
        formatter = treefmt.config.build.wrapper;
      }
    );
  # keep-sorted end
}
