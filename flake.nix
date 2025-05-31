{
  description = "Redmine REST-API wrapper library for deno";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    flake-utils.url = "github:numtide/flake-utils";
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
        runAs = name: script: {
          type = "app";
          program = script |> pkgs.writeShellScript name |> toString;
        };
      in
      {
        formatter = treefmt.config.build.wrapper;
        checks = {
          formatting = treefmt.config.build.check self;
        };
        apps = {
          check-actions =
            ''
              set -e
              ${pkgs.actionlint}/bin/actionlint --version
              ${pkgs.actionlint}/bin/actionlint
              ${pkgs.ghalint}/bin/ghalint --version
              ${pkgs.ghalint}/bin/ghalint run
              ${pkgs.zizmor}/bin/zizmor --version
              ${pkgs.zizmor}/bin/zizmor ./.github/workflows
            ''
            |> runAs "check-actions";
          check-renovate-config =
            ''
              set -e
              ${pkgs.renovate}/bin/renovate-config-validator renovate.json5
            ''
            |> runAs "check-renovate-config";
          check-deno =
            ''
              set -e
              ${pkgs.deno}/bin/deno task check
              ${pkgs.deno}/bin/deno task lint
              ${pkgs.deno}/bin/deno task test
            ''
            |> runAs "check-deno";
          test-coverage =
            ''
              set -e
              ${pkgs.deno}/bin/deno task test:coverage
            ''
            |> runAs "test-coverage";
        };
      }
    );
}
