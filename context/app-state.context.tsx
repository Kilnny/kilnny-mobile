import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppState = 'installed' | 'hasUpdate' | 'noInstalled';

export interface App {
  id: number;
  name: string;
  version: string;
  description: string;
  picture: string;
  state: AppState;
  developer: string;
  releaseDate: string;
  size: string;
  whatToTest: string;
}

const initialApps: App[] = [
  {
    id: 1,
    name: "App One",
    version: "1.0.0",
    description: "Description for App One",
    picture:
      "https://cdn.pixabay.com/photo/2015/09/10/21/53/fractal-935011_640.jpg",
    state: "hasUpdate",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
  {
    id: 2,
    name: "App Two",
    version: "1.0.0",
    description: "Description for App Two",
    picture:
      "https://cdn.pixabay.com/photo/2012/03/02/12/41/fractal-21236_640.jpg",
    state: "noInstalled",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
  {
    id: 3,
    name: "App Three",
    version: "1.0.0",
    description: "Description for App Three",
    picture:
      "https://cdn.pixabay.com/photo/2019/09/13/19/18/coffee-4474690_640.jpg",
    state: "noInstalled",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
  {
    id: 4,
    name: "App Four",
    version: "1.0.0",
    description: "Description for App Four",
    picture:
      "https://cdn.pixabay.com/photo/2015/09/10/21/54/purple-935012_640.jpg",
    state: "hasUpdate",
    developer: "Developer One",
    releaseDate: "2021-01-01",
    size: "10MB",
    whatToTest: "Test One, Test Two, Test Three",
  },
];

interface AppsContextType {
  apps: App[];
  isLoading: boolean;
  refreshing: boolean;
  updateAppState: (id: number) => void;
  refreshApps: () => void;
}

const AppsContext = createContext<AppsContextType | undefined>(undefined);

export const useApps = () => {
  const context = useContext(AppsContext);
  if (context === undefined) {
    throw new Error("useApps must be used within an AppsProvider");
  }
  return context;
};

export const AppsProvider = ({ children }: { children: ReactNode }) => {
  const [apps, setApps] = useState<App[]>(initialApps);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const updateAppState = (id: number) => {
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.id === id
          ? {
              ...app,
              state:
                app.state === "noInstalled" || app.state === "hasUpdate"
                  ? "installed"
                  : app.state,
            }
          : app
      )
    );
  };

  const refreshApps = () => {
    setRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setApps(initialApps);
      setRefreshing(false);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    setTimeout(() => {
      setApps(initialApps);
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <AppsContext.Provider
      value={{
        apps,
        isLoading,
        refreshing,
        updateAppState,
        refreshApps,
      }}
    >
      {children}
    </AppsContext.Provider>
  );
};