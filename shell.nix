let
  pkgs = import <nixpkgs> {};

  unstablePkgs = import (fetchTarball {
    url = "https://github.com/NixOS/nixpkgs/archive/nixos-unstable.tar.gz";
  }) {};
in
  pkgs.mkShell {
    nativeBuildInputs = with pkgs; [
      pkg-config
      gobject-introspection
      cargo
      cargo-tauri
    ];

    buildInputs = with pkgs; [
      at-spi2-atk
      atkmm
      cairo
      gdk-pixbuf
      glib
      gtk3
      harfbuzz
      librsvg
      libsoup_3
      pango
      webkitgtk_4_1

      openssl
      stdenv.cc.cc.lib
    ];

    packages = with pkgs;
      [
        bun
      ]
      ++ [
        unstablePkgs.prisma-engines_7
      ];

    PRISMA_SCHEMA_ENGINE_BINARY = "${unstablePkgs.prisma-engines_7}/bin/schema-engine";
    PRISMA_QUERY_ENGINE_BINARY = "${unstablePkgs.prisma-engines_7}/bin/query-engine";

    shellHook = ''
      export CARGO_TARGET_DIR=$(pwd)/src-tauri/target
      export RUST_BACKTRACE=1
      export LD_LIBRARY_PATH=${pkgs.stdenv.cc.cc.lib}/lib:$LD_LIBRARY_PATH
    '';
  }
