BUILD_DIR=./dist
BUN=bun
MV2_FILE_NAME=mv2.zip
MV2_HASHSUM_FILE_NAME=mv2_checksums.sha
MV3_HASHSUM_FILE_NAME=mv3_checksums.sha
MV3_FILE_NAME=mv3.zip

all: build

clean:
	rm -rf $(BUILD_DIR) *.zip *.crx *.sha

build: clean
	$(BUN) run build
	cd $(BUILD_DIR) && zip -r ../$(MV2_FILE_NAME) ./
	cd $(BUILD_DIR) && find . -type f -exec shasum {} + > ../$(MV2_HASHSUM_FILE_NAME)
	rm -rf $(BUILD_DIR)
	$(BUN) run build:v3
	cd $(BUILD_DIR) && zip -r ../$(MV3_FILE_NAME) ./
	cd $(BUILD_DIR) && find . -type f -exec shasum {} + > ../$(MV3_HASHSUM_FILE_NAME)
	@echo "Done building beabry wallet"
