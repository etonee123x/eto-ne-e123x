type Location = string;

export class FilesLocation {
  readonly fs: Location;
  readonly src: Location;

  constructor(parameters: { fs: Location; src: Location }) {
    this.fs = parameters.fs;
    this.src = parameters.src;
  }
}
