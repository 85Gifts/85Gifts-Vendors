import { cn } from "@/lib/utils";
import { GithubIcon } from "@/components/icons/github-icon";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FullWidthDivider } from "@/components/full-width-divider";

export function Footer2() {
	return (
		<footer
			className={cn(
				"relative mx-auto max-w-5xl lg:border-x",
				"dark:bg-[radial-gradient(35%_80%_at_15%_0%,--theme(--color-foreground/.1),transparent)]"
			)}
		>
			<FullWidthDivider position="top" />
			<div className="grid max-w-5xl grid-cols-6 gap-6 p-4">
				<div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
				
					<p className="max-w-sm text-balance text-muted-foreground text-sm">
						One platform for events & ticket booking, product & inventory management,
						cross-platform ads, invoices & receipts, payment links, and secure
						buyer-seller escrow.
					</p>
					<div className="flex gap-2">
						{socialLinks.map((item, index) => (
							<Button
								asChild
								key={`social-${item.link}-${index}`}
								size="icon"
								variant="outline"
							>
								<a href={item.link} target="_blank">
									{item.icon}
								</a>
							</Button>
						))}
					</div>
				</div>
				<div className="col-span-3 w-full md:col-span-1">
					<span className="text-muted-foreground text-xs">Resources</span>
					<div className="mt-2 flex flex-col gap-2">
						{resources.map(({ href, title }) => (
							<a
								className="w-max text-sm text-muted-foreground hover:text-foreground transition-colors"
								href={href}
								key={title}
							>
								{title}
							</a>
						))}
					</div>
				</div>
				<div className="col-span-3 w-full md:col-span-1">
					<span className="text-muted-foreground text-xs">Company</span>
					<div className="mt-2 flex flex-col gap-2">
						{company.map(({ href, title }) => (
							<a
								className="w-max text-sm text-muted-foreground hover:text-foreground transition-colors"
								href={href}
								key={title}
							>
								{title}
							</a>
						))}
					</div>
				</div>
			</div>
			<FullWidthDivider />
			<div className="flex items-center justify-center gap-2 py-4">
				<p className="text-center font-light text-muted-foreground text-sm">
					&copy; {new Date().getFullYear()} omniflow85, All rights reserved
				</p>
			</div>
		</footer>
	);
}

const company = [
	{
		title: "About Us",
		href: "#",
	},
	{
		title: "Careers",
		href: "#",
	},
	{
		title: "Brand assets",
		href: "#",
	},
	{
		title: "Privacy Policy",
		href: "#",
	},
	{
		title: "Terms of Service",
		href: "#",
	},
];

const resources = [
	{
		title: "Blog",
		href: "#",
	},
	{
		title: "Help Center",
		href: "#",
	},
	{
		title: "Contact Support",
		href: "#",
	},
	{
		title: "Community",
		href: "#",
	},
	{
		title: "Security",
		href: "#",
	},
];

const socialLinks = [
	{
		icon: <GithubIcon />,
		link: "#",
	},
	{
		icon: <InstagramIcon />,
		link: "#",
	},
	{
		icon: <XIcon />,
		link: "#",
	},
];
