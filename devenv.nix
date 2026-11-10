{ pkgs, ... }:
{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    npm.enable = true;
  };
  packages = [ pkgs.poppler-utils pkgs.curl pkgs.chromium ];
  env.CHROMIUM_PATH = "${pkgs.chromium}/bin/chromium";
  scripts.adm-serve.exec = ''
    set -e
    npm run build
    exec npm exec vite -- preview --host 127.0.0.1 --port 4173 --strictPort
  '';
  processes.adm.exec = "adm-serve";
}
