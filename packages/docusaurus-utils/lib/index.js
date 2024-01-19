"use strict";
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarkdownHeadingId = exports.getAuthorVisibility = exports.groupAuthoredItems = exports.normalizeFrontMatterAuthors = exports.getTagVisibility = exports.groupTaggedItems = exports.normalizeFrontMatterTags = exports.buildSshUrl = exports.buildHttpsUrl = exports.hasSSHProtocol = exports.removeTrailingSlash = exports.addTrailingSlash = exports.addLeadingSlash = exports.serializeURLPath = exports.parseURLPath = exports.resolvePathname = exports.isValidPathname = exports.encodePath = exports.fileToPath = exports.getEditUrl = exports.normalizeUrl = exports.findAsyncSequential = exports.mapAsyncSequential = exports.removePrefix = exports.removeSuffix = exports.localizePath = exports.getPluginI18nPath = exports.updateTranslationFileMessages = exports.mergeTranslations = exports.GitNotFoundError = exports.FileNotTrackedError = exports.getFileCommitDate = exports.readOutputHTMLFile = exports.generate = exports.WEBPACK_URL_LOADER_LIMIT = exports.DEFAULT_PLUGIN_ID = exports.DEFAULT_PORT = exports.CODE_TRANSLATIONS_FILE_NAME = exports.DEFAULT_I18N_DIR_NAME = exports.THEME_PATH = exports.OUTPUT_STATIC_ASSETS_DIR_NAME = exports.DEFAULT_STATIC_DIR_NAME = exports.SRC_DIR_NAME = exports.GENERATED_FILES_DIR_NAME = exports.BABEL_CONFIG_FILE_NAME = exports.DEFAULT_CONFIG_FILE_NAME = exports.DEFAULT_BUILD_DIR_NAME = exports.DOCUSAURUS_VERSION = exports.NODE_MINOR_VERSION = exports.NODE_MAJOR_VERSION = void 0;
exports.escapeRegexp = exports.isUnlisted = exports.isDraft = exports.getFolderContainingFile = exports.findFolderContainingFile = exports.getContentPathList = exports.getDataFileData = exports.getDataFilePath = exports.loadFreshModule = exports.escapeShellArg = exports.getWebpackLoaderCompilerName = exports.getFileLoaderUtils = exports.createAbsoluteFilePathMatcher = exports.createMatcher = exports.GlobExcludeDefault = exports.Globby = exports.docuHash = exports.simpleHash = exports.md5Hash = exports.addTrailingPathSeparator = exports.escapePath = exports.aliasedSitePath = exports.toMessageRelativeFilePath = exports.posixPath = exports.shortName = exports.isNameTooLong = exports.createSlugger = exports.replaceMarkdownLinks = exports.writeMarkdownHeadingId = exports.parseMarkdownFile = exports.parseMarkdownContentTitle = exports.DEFAULT_PARSE_FRONT_MATTER = exports.createExcerpt = exports.admonitionTitleToDirectiveLabel = exports.unwrapMdxCodeBlocks = exports.escapeMarkdownHeadingIds = void 0;
var constants_1 = require("./constants");
Object.defineProperty(exports, "NODE_MAJOR_VERSION", { enumerable: true, get: function () { return constants_1.NODE_MAJOR_VERSION; } });
Object.defineProperty(exports, "NODE_MINOR_VERSION", { enumerable: true, get: function () { return constants_1.NODE_MINOR_VERSION; } });
Object.defineProperty(exports, "DOCUSAURUS_VERSION", { enumerable: true, get: function () { return constants_1.DOCUSAURUS_VERSION; } });
Object.defineProperty(exports, "DEFAULT_BUILD_DIR_NAME", { enumerable: true, get: function () { return constants_1.DEFAULT_BUILD_DIR_NAME; } });
Object.defineProperty(exports, "DEFAULT_CONFIG_FILE_NAME", { enumerable: true, get: function () { return constants_1.DEFAULT_CONFIG_FILE_NAME; } });
Object.defineProperty(exports, "BABEL_CONFIG_FILE_NAME", { enumerable: true, get: function () { return constants_1.BABEL_CONFIG_FILE_NAME; } });
Object.defineProperty(exports, "GENERATED_FILES_DIR_NAME", { enumerable: true, get: function () { return constants_1.GENERATED_FILES_DIR_NAME; } });
Object.defineProperty(exports, "SRC_DIR_NAME", { enumerable: true, get: function () { return constants_1.SRC_DIR_NAME; } });
Object.defineProperty(exports, "DEFAULT_STATIC_DIR_NAME", { enumerable: true, get: function () { return constants_1.DEFAULT_STATIC_DIR_NAME; } });
Object.defineProperty(exports, "OUTPUT_STATIC_ASSETS_DIR_NAME", { enumerable: true, get: function () { return constants_1.OUTPUT_STATIC_ASSETS_DIR_NAME; } });
Object.defineProperty(exports, "THEME_PATH", { enumerable: true, get: function () { return constants_1.THEME_PATH; } });
Object.defineProperty(exports, "DEFAULT_I18N_DIR_NAME", { enumerable: true, get: function () { return constants_1.DEFAULT_I18N_DIR_NAME; } });
Object.defineProperty(exports, "CODE_TRANSLATIONS_FILE_NAME", { enumerable: true, get: function () { return constants_1.CODE_TRANSLATIONS_FILE_NAME; } });
Object.defineProperty(exports, "DEFAULT_PORT", { enumerable: true, get: function () { return constants_1.DEFAULT_PORT; } });
Object.defineProperty(exports, "DEFAULT_PLUGIN_ID", { enumerable: true, get: function () { return constants_1.DEFAULT_PLUGIN_ID; } });
Object.defineProperty(exports, "WEBPACK_URL_LOADER_LIMIT", { enumerable: true, get: function () { return constants_1.WEBPACK_URL_LOADER_LIMIT; } });
var emitUtils_1 = require("./emitUtils");
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return emitUtils_1.generate; } });
Object.defineProperty(exports, "readOutputHTMLFile", { enumerable: true, get: function () { return emitUtils_1.readOutputHTMLFile; } });
var gitUtils_1 = require("./gitUtils");
Object.defineProperty(exports, "getFileCommitDate", { enumerable: true, get: function () { return gitUtils_1.getFileCommitDate; } });
Object.defineProperty(exports, "FileNotTrackedError", { enumerable: true, get: function () { return gitUtils_1.FileNotTrackedError; } });
Object.defineProperty(exports, "GitNotFoundError", { enumerable: true, get: function () { return gitUtils_1.GitNotFoundError; } });
var i18nUtils_1 = require("./i18nUtils");
Object.defineProperty(exports, "mergeTranslations", { enumerable: true, get: function () { return i18nUtils_1.mergeTranslations; } });
Object.defineProperty(exports, "updateTranslationFileMessages", { enumerable: true, get: function () { return i18nUtils_1.updateTranslationFileMessages; } });
Object.defineProperty(exports, "getPluginI18nPath", { enumerable: true, get: function () { return i18nUtils_1.getPluginI18nPath; } });
Object.defineProperty(exports, "localizePath", { enumerable: true, get: function () { return i18nUtils_1.localizePath; } });
var jsUtils_1 = require("./jsUtils");
Object.defineProperty(exports, "removeSuffix", { enumerable: true, get: function () { return jsUtils_1.removeSuffix; } });
Object.defineProperty(exports, "removePrefix", { enumerable: true, get: function () { return jsUtils_1.removePrefix; } });
Object.defineProperty(exports, "mapAsyncSequential", { enumerable: true, get: function () { return jsUtils_1.mapAsyncSequential; } });
Object.defineProperty(exports, "findAsyncSequential", { enumerable: true, get: function () { return jsUtils_1.findAsyncSequential; } });
var urlUtils_1 = require("./urlUtils");
Object.defineProperty(exports, "normalizeUrl", { enumerable: true, get: function () { return urlUtils_1.normalizeUrl; } });
Object.defineProperty(exports, "getEditUrl", { enumerable: true, get: function () { return urlUtils_1.getEditUrl; } });
Object.defineProperty(exports, "fileToPath", { enumerable: true, get: function () { return urlUtils_1.fileToPath; } });
Object.defineProperty(exports, "encodePath", { enumerable: true, get: function () { return urlUtils_1.encodePath; } });
Object.defineProperty(exports, "isValidPathname", { enumerable: true, get: function () { return urlUtils_1.isValidPathname; } });
Object.defineProperty(exports, "resolvePathname", { enumerable: true, get: function () { return urlUtils_1.resolvePathname; } });
Object.defineProperty(exports, "parseURLPath", { enumerable: true, get: function () { return urlUtils_1.parseURLPath; } });
Object.defineProperty(exports, "serializeURLPath", { enumerable: true, get: function () { return urlUtils_1.serializeURLPath; } });
Object.defineProperty(exports, "addLeadingSlash", { enumerable: true, get: function () { return urlUtils_1.addLeadingSlash; } });
Object.defineProperty(exports, "addTrailingSlash", { enumerable: true, get: function () { return urlUtils_1.addTrailingSlash; } });
Object.defineProperty(exports, "removeTrailingSlash", { enumerable: true, get: function () { return urlUtils_1.removeTrailingSlash; } });
Object.defineProperty(exports, "hasSSHProtocol", { enumerable: true, get: function () { return urlUtils_1.hasSSHProtocol; } });
Object.defineProperty(exports, "buildHttpsUrl", { enumerable: true, get: function () { return urlUtils_1.buildHttpsUrl; } });
Object.defineProperty(exports, "buildSshUrl", { enumerable: true, get: function () { return urlUtils_1.buildSshUrl; } });
var tags_1 = require("./tags");
Object.defineProperty(exports, "normalizeFrontMatterTags", { enumerable: true, get: function () { return tags_1.normalizeFrontMatterTags; } });
Object.defineProperty(exports, "groupTaggedItems", { enumerable: true, get: function () { return tags_1.groupTaggedItems; } });
Object.defineProperty(exports, "getTagVisibility", { enumerable: true, get: function () { return tags_1.getTagVisibility; } });
var authors_1 = require("./authors");
Object.defineProperty(exports, "normalizeFrontMatterAuthors", { enumerable: true, get: function () { return authors_1.normalizeFrontMatterAuthors; } });
Object.defineProperty(exports, "groupAuthoredItems", { enumerable: true, get: function () { return authors_1.groupAuthoredItems; } });
Object.defineProperty(exports, "getAuthorVisibility", { enumerable: true, get: function () { return authors_1.getAuthorVisibility; } });
var markdownUtils_1 = require("./markdownUtils");
Object.defineProperty(exports, "parseMarkdownHeadingId", { enumerable: true, get: function () { return markdownUtils_1.parseMarkdownHeadingId; } });
Object.defineProperty(exports, "escapeMarkdownHeadingIds", { enumerable: true, get: function () { return markdownUtils_1.escapeMarkdownHeadingIds; } });
Object.defineProperty(exports, "unwrapMdxCodeBlocks", { enumerable: true, get: function () { return markdownUtils_1.unwrapMdxCodeBlocks; } });
Object.defineProperty(exports, "admonitionTitleToDirectiveLabel", { enumerable: true, get: function () { return markdownUtils_1.admonitionTitleToDirectiveLabel; } });
Object.defineProperty(exports, "createExcerpt", { enumerable: true, get: function () { return markdownUtils_1.createExcerpt; } });
Object.defineProperty(exports, "DEFAULT_PARSE_FRONT_MATTER", { enumerable: true, get: function () { return markdownUtils_1.DEFAULT_PARSE_FRONT_MATTER; } });
Object.defineProperty(exports, "parseMarkdownContentTitle", { enumerable: true, get: function () { return markdownUtils_1.parseMarkdownContentTitle; } });
Object.defineProperty(exports, "parseMarkdownFile", { enumerable: true, get: function () { return markdownUtils_1.parseMarkdownFile; } });
Object.defineProperty(exports, "writeMarkdownHeadingId", { enumerable: true, get: function () { return markdownUtils_1.writeMarkdownHeadingId; } });
var markdownLinks_1 = require("./markdownLinks");
Object.defineProperty(exports, "replaceMarkdownLinks", { enumerable: true, get: function () { return markdownLinks_1.replaceMarkdownLinks; } });
var slugger_1 = require("./slugger");
Object.defineProperty(exports, "createSlugger", { enumerable: true, get: function () { return slugger_1.createSlugger; } });
var pathUtils_1 = require("./pathUtils");
Object.defineProperty(exports, "isNameTooLong", { enumerable: true, get: function () { return pathUtils_1.isNameTooLong; } });
Object.defineProperty(exports, "shortName", { enumerable: true, get: function () { return pathUtils_1.shortName; } });
Object.defineProperty(exports, "posixPath", { enumerable: true, get: function () { return pathUtils_1.posixPath; } });
Object.defineProperty(exports, "toMessageRelativeFilePath", { enumerable: true, get: function () { return pathUtils_1.toMessageRelativeFilePath; } });
Object.defineProperty(exports, "aliasedSitePath", { enumerable: true, get: function () { return pathUtils_1.aliasedSitePath; } });
Object.defineProperty(exports, "escapePath", { enumerable: true, get: function () { return pathUtils_1.escapePath; } });
Object.defineProperty(exports, "addTrailingPathSeparator", { enumerable: true, get: function () { return pathUtils_1.addTrailingPathSeparator; } });
var hashUtils_1 = require("./hashUtils");
Object.defineProperty(exports, "md5Hash", { enumerable: true, get: function () { return hashUtils_1.md5Hash; } });
Object.defineProperty(exports, "simpleHash", { enumerable: true, get: function () { return hashUtils_1.simpleHash; } });
Object.defineProperty(exports, "docuHash", { enumerable: true, get: function () { return hashUtils_1.docuHash; } });
var globUtils_1 = require("./globUtils");
Object.defineProperty(exports, "Globby", { enumerable: true, get: function () { return globUtils_1.Globby; } });
Object.defineProperty(exports, "GlobExcludeDefault", { enumerable: true, get: function () { return globUtils_1.GlobExcludeDefault; } });
Object.defineProperty(exports, "createMatcher", { enumerable: true, get: function () { return globUtils_1.createMatcher; } });
Object.defineProperty(exports, "createAbsoluteFilePathMatcher", { enumerable: true, get: function () { return globUtils_1.createAbsoluteFilePathMatcher; } });
var webpackUtils_1 = require("./webpackUtils");
Object.defineProperty(exports, "getFileLoaderUtils", { enumerable: true, get: function () { return webpackUtils_1.getFileLoaderUtils; } });
Object.defineProperty(exports, "getWebpackLoaderCompilerName", { enumerable: true, get: function () { return webpackUtils_1.getWebpackLoaderCompilerName; } });
var shellUtils_1 = require("./shellUtils");
Object.defineProperty(exports, "escapeShellArg", { enumerable: true, get: function () { return shellUtils_1.escapeShellArg; } });
var moduleUtils_1 = require("./moduleUtils");
Object.defineProperty(exports, "loadFreshModule", { enumerable: true, get: function () { return moduleUtils_1.loadFreshModule; } });
var dataFileUtils_1 = require("./dataFileUtils");
Object.defineProperty(exports, "getDataFilePath", { enumerable: true, get: function () { return dataFileUtils_1.getDataFilePath; } });
Object.defineProperty(exports, "getDataFileData", { enumerable: true, get: function () { return dataFileUtils_1.getDataFileData; } });
Object.defineProperty(exports, "getContentPathList", { enumerable: true, get: function () { return dataFileUtils_1.getContentPathList; } });
Object.defineProperty(exports, "findFolderContainingFile", { enumerable: true, get: function () { return dataFileUtils_1.findFolderContainingFile; } });
Object.defineProperty(exports, "getFolderContainingFile", { enumerable: true, get: function () { return dataFileUtils_1.getFolderContainingFile; } });
var contentVisibilityUtils_1 = require("./contentVisibilityUtils");
Object.defineProperty(exports, "isDraft", { enumerable: true, get: function () { return contentVisibilityUtils_1.isDraft; } });
Object.defineProperty(exports, "isUnlisted", { enumerable: true, get: function () { return contentVisibilityUtils_1.isUnlisted; } });
var regExpUtils_1 = require("./regExpUtils");
Object.defineProperty(exports, "escapeRegexp", { enumerable: true, get: function () { return regExpUtils_1.escapeRegexp; } });
//# sourceMappingURL=index.js.map