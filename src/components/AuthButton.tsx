import { Button } from "@/components/ui/button";
import { Github, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthButton() {
    const { user, login, logout } = useAuth();

    if (!user) {
        return (
            <Button
                onClick={login}
                variant="outline"
                className="gap-2 bg-white hover:bg-gray-50 transition-all duration-300 border border-gray-200 shadow-sm"
            >
                <Github className="h-4 w-4" />
                <span>Sign in with GitHub</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url} alt={user.login} />
                        <AvatarFallback>{user.login?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}