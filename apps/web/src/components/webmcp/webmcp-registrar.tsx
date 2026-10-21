"use client";

import {
	registerMyPickUAEWebMcpServiceWorker,
	registerMyPickUAEWebMcpTools,
} from "@/lib/webmcp";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export function WebMcpRegistrar() {
	const locale = useLocale();

	useEffect(() => {
		return registerMyPickUAEWebMcpTools({ locale });
	}, [locale]);

	useEffect(() => {
		void registerMyPickUAEWebMcpServiceWorker();
	}, []);

	return null;
}
