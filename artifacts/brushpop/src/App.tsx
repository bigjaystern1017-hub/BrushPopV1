import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";

import KidSelect from "./pages/KidSelect";
import Setup from "./pages/Setup";
import Brush from "./pages/Brush";
import Celebrate from "./pages/Celebrate";
import Collection from "./pages/Collection";
import Splash from "@/pages/Splash";
import StreakPage from "./pages/StreakPage";
import Photos from "./pages/Photos";
import About from "./pages/About";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={KidSelect} />
        <Route path="/setup" component={Setup} />
        <Route path="/setup/:id" component={Setup} />
        <Route path="/brush/:id" component={Brush} />
        <Route path="/celebrate/:id" component={Celebrate} />
        <Route path="/collection/:id" component={Collection} />
        <Route path="/streak/:id" component={StreakPage} />
        <Route path="/photos/:id" component={Photos} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <TooltipProvider>
      <>
        {!splashDone && <Splash onComplete={() => setSplashDone(true)} />}
        <div style={{ visibility: splashDone ? "visible" : "hidden" }}>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </div>
      </>
    </TooltipProvider>
  );
}

export default App;
