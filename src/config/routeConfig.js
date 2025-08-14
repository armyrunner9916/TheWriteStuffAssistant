import React from 'react';

    import SignIn from "@/pages/SignIn";
    import SignUp from "@/pages/SignUp";
    import Dashboard from "@/pages/Dashboard";
    
    import PoetryHistory from "@/pages/PoetryHistory";
    import NonfictionHistory from "@/pages/NonfictionHistory";
    import ContentCreationHistory from "@/pages/ContentCreationHistory";
    import SongwritingHistory from "@/pages/SongwritingHistory";
    import StageScreenHistory from "@/pages/StageScreenHistory";
    import History from "@/pages/History";

    import Prose from "@/pages/Prose";

    import Poetry from "@/pages/Poetry";

    import StageScreen from "@/pages/StageScreen";

    import Nonfiction from "@/pages/Nonfiction";

    import OnlineContent from "@/pages/OnlineContent";

    import Songwriting from "@/pages/Songwriting";

    export const routeConfig = [
      { path: "/", element: SignIn, isPublic: true, exact: true },
      { path: "/signup", element: SignUp, isPublic: true },
      { path: "/dashboard", element: Dashboard, isProtected: true },
      { path: "/history/fictional_prose_unified", element: History, isProtected: true },
      { path: "/history/poetry_unified", element: PoetryHistory, isProtected: true },
      { path: "/history/nonfiction_unified", element: NonfictionHistory, isProtected: true },
      { path: "/history/content_creation_unified", element: ContentCreationHistory, isProtected: true },
      { path: "/history/songwriting_unified", element: SongwritingHistory, isProtected: true },
      { path: "/history/stage_screen_unified", element: StageScreenHistory, isProtected: true },
      { path: "/history/:section", element: History, isProtected: true },

      { path: "/prose", element: Prose, isProtected: true },

      { path: "/poetry", element: Poetry, isProtected: true },

      { path: "/stage-screen", element: StageScreen, isProtected: true },

      { path: "/nonfiction", element: Nonfiction, isProtected: true },

      { path: "/online-content", element: OnlineContent, isProtected: true },

      { path: "/songwriting", element: Songwriting, isProtected: true },
    ];