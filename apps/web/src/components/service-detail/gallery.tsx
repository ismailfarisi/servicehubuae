"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Props {
	images: string[];
	alt: string;
	/** Accessible label for a thumbnail button; receives the 1-based photo number. */
	thumbLabel: (n: number) => string;
}

/** Main 4:3 photo plus clickable thumbnails that swap it in. */
export function ServiceGallery({ images, alt, thumbLabel }: Props) {
	const [active, setActive] = useState(0);
	const current = images[active] ?? images[0];

	return (
		<div className="space-y-3">
			<div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-nl-cacao/10 bg-nl-pearl shadow-sm">
				{current ? (
					<Image
						key={current}
						src={current}
						alt={alt}
						fill
						sizes="(min-width: 1024px) 50vw, 100vw"
						className="object-cover"
						priority={active === 0}
					/>
				) : (
					<div className="flex h-full items-center justify-center">
						<ImageIcon
							aria-hidden="true"
							className="h-12 w-12 text-nl-russet/40"
							strokeWidth={1.25}
						/>
					</div>
				)}
				{images.length > 1 && (
					<span className="absolute bottom-3 end-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
						{active + 1} / {images.length}
					</span>
				)}
			</div>

			{images.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{images.slice(0, 8).map((url, i) => (
						<button
							key={url}
							type="button"
							onClick={() => setActive(i)}
							aria-label={thumbLabel(i + 1)}
							aria-current={i === active}
							className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-nl-pearl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nl-amber ${
								i === active
									? "border-nl-amber"
									: "border-transparent opacity-70 hover:opacity-100"
							}`}
						>
							<Image
								src={url}
								alt=""
								fill
								sizes="80px"
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
