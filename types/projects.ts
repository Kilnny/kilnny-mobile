
export enum BuildState {
  INSTALLED = 'installed',
  HAS_UPDATE = 'hasUpdate',
  NOT_INSTALLED = 'noInstalled',
}

export interface Build {
  id: string;
  version: string;
  projectId: string;
  buildNumber: number;
  filePath: string;
  packageName?: string;
  releaseNotes?: string;
  whatToTest?: string;
  size?: string;
  state: BuildState;
  buildStatus?: string;
  statusMessage?: string;
  errorMessage?: string;
  releaseDate: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  picture?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  latestBuild?: Build;
  developer?: string;
}

export interface ProjectsResponse {
  data: Project[];
}

export interface ProjectBuildsResponse {
  data: Build[];
}