with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephium-explorer";
    shellHook = ''
    '';
    buildInputs = [
      nodejs python
    ];
  };
}
