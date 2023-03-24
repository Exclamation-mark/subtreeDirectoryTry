
upload_crowdin:
	crowdin upload sources
	crowdin upload translations

download_crowdin:
	crowdin download

l10n_gen:
	ts-node ./src/generatel10nJson.ts ./l10n/ ./setting/

env_gen:
	ts-node ./src/generateL10nEnv.ts ./l10n/ ./setting/ .setting