import type { NavTab } from "@/lib/api/navigation";
import { MegaMenuRoot } from "./mega-menu-root";

interface Props {
	tabs: NavTab[];
}

export function NavBar({ tabs }: Props) {
	if (tabs.length === 0) return null;
	return (
		<div className="hidden lg:block border-t border-nl-cacao/5 bg-nl-linen/95">
			<div className="max-w-[1400px] mx-auto px-4 md:px-12">
				<ul className="flex items-center gap-7 h-12 list-none m-0 p-0">
					{tabs.map((tab) => (
						<li key={tab.id}>
							<a
								href={tab.href}
								className="text-sm font-medium text-nl-russet hover:text-nl-cacao transition-colors"
								data-mega-tab-trigger
								data-tab-id={tab.id}
								aria-haspopup={
									tab.subcategories.length ||
									tab.brand_list.brands.length ||
									tab.promo_tiles.length
										? "menu"
										: undefined
								}
							>
								{tab.label}
							</a>
						</li>
					))}
				</ul>
				<MegaMenuRoot tabs={tabs} />
			</div>
		</div>
	);
}
