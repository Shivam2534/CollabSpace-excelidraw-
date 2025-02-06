"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { signOut } from "next-auth/react";
import axios from "axios";
import { HTTP_BACKEND_URL } from "@repo/common/types";
import Link from "next/link";

// Mock data for rooms (replace this with actual data from your state management or API)

function LandingNavbar({ session, status, setIsDialogOpen }) {
  const [mockRooms, setmockRooms] = useState([]);
  async function findAllRoomsOFUser() {
    const res = await axios.get(`${HTTP_BACKEND_URL}/api/v1/findallrooms`, {
      headers: {
        Authorization: session?.accessToken,
      },
    });
    if (res.data.success) {
      setmockRooms(res.data.rooms);
    }
  }
  useEffect(() => {
    if (status == "authenticated") {
      findAllRoomsOFUser();
    }
  }, [status]);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">DrawChat</div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-white hover:text-gray-300s">
            Home
          </Button>
          <Button variant="ghost" className="text-white hover:text-gray-300">
            About
          </Button>

          {/* Rooms Dropdown */}
          {status == "authenticated" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white hover:text-gray-300"
                >
                  My Rooms <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 text-white border-gray-700">
                <DropdownMenuLabel>Your Rooms</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                {mockRooms?.map((room: any) => (
                  <Link href={`/canvas/${room.id}`} key={room.id}>
                    <DropdownMenuItem
                      // key={room.id}
                      className="hover:bg-gray-700 cursor-pointer"
                    >
                      <span>{room.slug}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        Room ID: {room.id}
                      </span>
                    </DropdownMenuItem>
                  </Link>
                ))}
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className="hover:bg-gray-700 cursor-pointer"
                  onClick={() => setIsDialogOpen((prev: boolean) => !prev)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create New Room</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-28 bg-gray-800 text-white border-gray-700">
              <DropdownMenuLabel>
                {session ? session.user.name : "Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              {status == "authenticated" && (
                <DropdownMenuItem className="hover:bg-gray-700">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              )}
              {status == "authenticated" ? (
                <DropdownMenuItem
                  className="hover:bg-gray-700"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="hover:bg-gray-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Signup</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

export default LandingNavbar;
