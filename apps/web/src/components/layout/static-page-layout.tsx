import type { ReactNode } from "react";

interface StaticPageLayoutProps {
	eyebrow?: string;
	title: string;
	intro?: string;
	children: ReactNode;
}

export function StaticPageLayout({
	eyebrow,
	title,
	intro,
	children,
}: StaticPageLayoutProps) {
	return (
		<div className="bg-nl-linen text-nl-cacao">
			<section className="bg-nl-pearl border-b border-nl-cacao/5">
				<div className="max-w-[1400px] mx-auto px-4 md:px-12 py-14 md:py-20">
					{eyebrow && (
						<p className="text-sm font-semibold text-nl-amber-text mb-3">
							{eyebrow}
						</p>
					)}
					<h1 className="font-display font-bold tracking-tight text-4xl md:text-5xl leading-tight text-nl-cacao">
						{title}
					</h1>
					{intro && (
						<p className="text-lg md:text-xl text-nl-russet mt-4 max-w-[640px] leading-relaxed">
							{intro}
						</p>
					)}
				</div>
			</section>

			<section className="max-w-[860px] mx-auto px-4 md:px-12 py-14 md:py-20">
				<div className="prose-static space-y-8">{children}</div>
			</section>
		</div>
	);
}

interface StaticSectionProps {
	heading?: string;
	children: ReactNode;
}

export function StaticSection({ heading, children }: StaticSectionProps) {
	return (
		<section>
			{heading && (
				<h2 className="font-display font-bold tracking-tight text-2xl md:text-3xl leading-tight text-nl-cacao mb-4">
					{heading}
				</h2>
			)}
			<div className="text-nl-russet text-[15px] md:text-base leading-relaxed space-y-4">
				{children}
			</div>
		</section>
	);
}
