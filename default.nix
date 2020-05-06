with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephscan";
    shellHook = ''
    '';
    buildInputs = [
      nodejs python
    ];
  };
}
