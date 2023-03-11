BUILD_DIR=./dist
YARN=yarn
MV2_FILE_NAME=mv2.zip
MV2_HASHSUM_FILE_NAME=mv2_checksums.sha
MV3_HASHSUM_FILE_NAME=mv3_checksums.sha
MV3_FILE_NAME=mv2.zip

all: build

clean:
	rm -fr $(BUILD_DIR) *.zip *.crx
	$(YARN) cache clean

build:
	make clean
	$(YARN) build
	cd dist &&\
		zip -r $(MV2_FILE_NAME) ./ &&\
		mv $(MV2_FILE_NAME)  ../ &&\
		cd ..
	shasum $(shell find ./dist/* -type f) > $(MV2_HASHSUM_FILE_NAME)
	rm -fr dist
	$(YARN) build:v3
	cd dist &&\
		zip -r $(MV3_FILE_NAME) ./ &&\
		mv $(MV3_FILE_NAME)  ../ &&\
		cd ..
	shasum $(shell find ./dist/* -type f) > $(MV3_HASHSUM_FILE_NAME)
	echo "Done build beabry wallet"
