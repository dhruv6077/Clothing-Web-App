# DO NOT TOUCH. THIS IS FOR KEVIN TO RUN THE SCRIPT TO POPULATE THE DATABASE ON HIS MACHINE
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python312
    pkgs.zlib
  ];
}
