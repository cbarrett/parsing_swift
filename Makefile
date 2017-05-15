MAKEFLAGS += --warn-undefined-variables
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := all
.DELETE_ON_ERROR:
.SUFFIXES:

OUTPUT ?= dist

sources := $(filter-out README.md,$(wildcard *.md))
pages := $(patsubst %.md,$(OUTPUT)/%.html,$(sources))
statics := copy.katex copy.reset copy.local
copy.katex.src := node_modules/katex/dist
copy.katex.files := katex.min.css fonts/
copy.reset.src := node_modules/reset-css
copy.reset.files := reset.css
copy.local.src := .
copy.local.files := style.css

FORCE:

.PHONY: setup
setup:
	npm install

.PHONY: build
build: $(pages) 

$(OUTPUT):
	mkdir $@

$(OUTPUT)/%.html: %.md | $(OUTPUT)
	./render.js $^ $@

.PHONY: static
static: $(statics)

copy.%: FORCE | $(OUTPUT)
	$(foreach x,$($@.files),rsync -a $($@.src)/$x $(OUTPUT)/$x ;)

.PHONY: all
all: build static

.PHONY: clean
clean:
	rm -rf $(OUTPUT)
