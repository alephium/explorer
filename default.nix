with import <nixpkgs> {}; {
  sdlEnv = stdenv.mkDerivation {
    name = "alephscan";
    shellHook = ''
    '';
    buildInputs = [
      yarn nodejs
    ];
  };
}
