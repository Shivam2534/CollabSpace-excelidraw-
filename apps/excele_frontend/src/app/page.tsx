"use client";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Share2,
  Users2,
  Sparkles,
  Github,
  Download,
  Menu,
  CircleUserRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CreateRoom from "./ourComponents/CreateRoom";
import EnterRoom from "./ourComponents/EnterRoom";
import LandingNavbar from "./ourComponents/LandingNavbar";
import { redirect } from "next/navigation";

export default function SessionProviderFn() {
  return (
    <SessionProvider>
      <App />
    </SessionProvider>
  );
}

function App() {
  const { data: session, status } = useSession();

  const [IsDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const inputRef = useRef(null);
  const RoomIdRef = useRef(null);
  const SuccessMsg = useRef(null);

  const [IsEnterRoomDialogOpen, setIsEnterRoomDialogOpen] =
    useState<boolean>(false);

  return (
    <div className="min-h-screen bg-background">
      {/* top bar */}
      <div className="w-full">
        <LandingNavbar
          session={session}
          status={status}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Collaborative Whiteboarding
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Create, collaborate, and share beautiful diagrams and sketches
              with our intuitive drawing tool. No sign-up required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!session ? (
                <div className="flex gap-6">
                  <Link href={"/api/auth/signin"}>
                    <Button size="lg" className="h-12 px-6">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" size="lg" className="h-12 px-6">
                      Sign up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-6">
                  <Button
                    size="lg"
                    className="h-12 px-6"
                    onClick={() => redirect("http://localhost:3000/")}
                  >
                    Chat Room
                  </Button>
                  <Button
                    size="lg"
                    className="h-12 px-6"
                    onClick={() => setIsEnterRoomDialogOpen((prev) => !prev)}
                  >
                    Join Canvas Room
                    <Pencil className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-6"
                    onClick={() => setIsDialogOpen((prev) => !prev)}
                  >
                    Create Canvas Room
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  Real-time Collaboration
                </h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Work together with your team in real-time. Share your drawings
                instantly with a simple link.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Multiplayer Editing</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Multiple users can edit the same canvas simultaneously. See
                who's drawing what in real-time.
              </p>
            </Card>

            <Card className="p-6 border-2 hover:border-primary transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Drawing</h3>
              </div>
              <p className="mt-4 text-muted-foreground">
                Intelligent shape recognition and drawing assistance helps you
                create perfect diagrams.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 sm:p-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to start creating?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
                Join thousands of users who are already creating amazing
                diagrams and sketches.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" variant="secondary" className="h-12 px-6">
                  Open Canvas
                  <Pencil className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 Excalidraw Clone. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://github.com"
                className="text-muted-foreground hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Download className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <CreateRoom
        IsDialogOpen={IsDialogOpen}
        SuccessMsg={SuccessMsg}
        inputRef={inputRef}
        RoomIdRef={RoomIdRef}
        setIsDialogOpen={setIsDialogOpen}
      />
      <EnterRoom
        IsEnterRoomDialogOpen={IsEnterRoomDialogOpen}
        setIsEnterRoomDialogOpen={setIsEnterRoomDialogOpen}
        session={session}
      />
    </div>
  );
}
