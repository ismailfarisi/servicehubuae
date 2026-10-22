import type { S3UploadClient } from "@mypickuae/ui";
import { api } from "./api";

// Presign + process-asset only. Layout video upload (/media/videos/layout/*)
// was removed with the product catalogue, so the optional layout-video
// methods are not implemented and the layout editor hides video upload.
export const s3UploadClient: S3UploadClient = {
	async presign(input) {
		const { data } = await api.post("/media/presign", {
			asset_type: input.assetType,
			filename: input.filename,
			content_type: input.contentType,
			vendor_id: input.vendorId,
		});
		return { uploadUrl: data.uploadUrl, key: data.key };
	},

	async putToS3(uploadUrl, file, onProgress) {
		await new Promise<void>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open("PUT", uploadUrl);
			xhr.setRequestHeader("Content-Type", file.type);
			xhr.upload.onprogress = (e) => {
				if (e.lengthComputable && onProgress) {
					onProgress(Math.round((e.loaded / e.total) * 100));
				}
			};
			xhr.onload = () =>
				xhr.status >= 200 && xhr.status < 300
					? resolve()
					: reject(new Error(`S3 PUT failed: ${xhr.status}`));
			xhr.onerror = () => reject(new Error("S3 PUT network error"));
			xhr.send(file);
		});
	},

	async processAsset(input) {
		const { data } = await api.post("/media/process-asset", {
			asset_type: input.assetType,
			key: input.key,
		});
		return { url: data.url };
	},
};
