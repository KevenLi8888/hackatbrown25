# Variables
DOCKER_REGISTRY ?= kevenli8888
IMAGE_NAME ?= wikirace-backend
IMAGE_TAG ?= latest
FULL_IMAGE_NAME = $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

all:
	go build -buildvcs=false -o wikirace-backend ./cmd

clean:
	rm -fv wikirace-backend
	rm -rfv tmp

lint:
	golangci-lint run cmd/... pkg/...

remake: clean all

# Docker commands
.PHONY: docker
docker: docker-build docker-push

.PHONY: docker-build
docker-build:
	docker build -t $(FULL_IMAGE_NAME) .

.PHONY: docker-push
docker-push:
	docker push $(FULL_IMAGE_NAME)