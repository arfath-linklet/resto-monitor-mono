import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const cycle = ["system", "light", "dark"] as const;

export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	const next = () => {
		const idx = cycle.indexOf(theme);
		setTheme(cycle[(idx + 1) % cycle.length]);
	};

	return (
		<Button variant="outline" size="icon-sm" onClick={next}>
			{theme === "light" && <SunIcon className="size-4" />}
			{theme === "dark" && <MoonIcon className="size-4" />}
			{theme === "system" && <MonitorIcon className="size-4" />}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
