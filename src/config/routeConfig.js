import React from 'react';

    import SignIn from "@/pages/SignIn";
    import SignUp from "@/pages/SignUp";
    import Dashboard from "@/pages/Dashboard";
    
    import FictionalProseHistory from "@/pages/FictionalProseHistory";
    import PoetryHistory from "@/pages/PoetryHistory";
    import NonfictionHistory from "@/pages/NonfictionHistory";
    import ContentCreationHistory from "@/pages/ContentCreationHistory";
    import SongwritingHistory from "@/pages/SongwritingHistory";
    import StageScreenHistory from "@/pages/StageScreenHistory";
    import History from "@/pages/History";

    import Prose from "@/pages/Prose";
    import Brainstorming from "@/pages/Brainstorming";

    import Poetry from "@/pages/Poetry";

    import StageScreen from "@/pages/StageScreen";

    import Nonfiction from "@/pages/Nonfiction";

    import OnlineContent from "@/pages/OnlineContent";

    import Songwriting from "@/pages/Songwriting";

    export const routeConfig = [
      { path: "/", element: SignIn, isPublic: true, exact: true },
      { path: "/signup", element: SignUp, isPublic: true },
      { path: "/dashboard", element: Dashboard, isProtected: true },
      { path: "/history/fictional-prose", element: FictionalProseHistory, isProtected: true },
      { path: "/history/poetry", element: PoetryHistory, isProtected: true },
      { path: "/history/nonfiction", element: NonfictionHistory, isProtected: true },
      { path: "/history/content-creation", element: ContentCreationHistory, isProtected: true },
      { path: "/history/songwriting", element: SongwritingHistory, isProtected: true },
      { path: "/history/stage-screen", element: StageScreenHistory, isProtected: true },
      { path: "/history/:section", element: History, isProtected: true },

      { path: "/prose", element: Prose, isProtected: true },
      { path: "/brainstorming", element: Brainstorming, isProtected: true },

      { path: "/poetry", element: Poetry, isProtected: true },

      { path: "/stage-screen", element: StageScreen, isProtected: true },

      { path: "/nonfiction", element: Nonfiction, isProtected: true },

      { path: "/online-content", element: OnlineContent, isProtected: true },

      { path: "/songwriting", element: Songwriting, isProtected: true },
    ];