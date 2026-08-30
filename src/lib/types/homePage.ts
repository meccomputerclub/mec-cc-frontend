export interface IHomePageData {
  heroSection: {
    title: string;
    subtitle: string;
    bgImgUrl: string;
    stats: {
      members: number;
      totalProjects: number;
      totalEvents: number;
      eventsPerYear: number;
    };
    links: {
      join: string;
      events: string;
    };
  };
  introSection: {
    title: string;
    description: string;
    label: string;
    imgUrl: string;
  };
  featuredData: {
    sponsors: string[];
    events: string[];
    gallery: string[];
    blogs: string[];
    projects: string[];
  };
}

export const defaultState: IHomePageData = {
  heroSection: {
    title: "",
    subtitle: "",
    bgImgUrl: "",
    stats: { members: 0, totalProjects: 0, totalEvents: 0, eventsPerYear: 0 },
    links: { join: "", events: "" },
  },
  introSection: { title: "", description: "", label: "", imgUrl: "" },
  featuredData: { sponsors: [], events: [], gallery: [], blogs: [], projects: [] },
};
