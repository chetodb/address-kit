# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-01-20

### Fixed
- Absolute URLs in README.md and README.es.md for better compatibility with target links on the NPM website.

## [0.2.0] - 2026-01-20

### Added
- **CI/CD Pipeline**: Automated publishing to NPM and automated GitHub Release creation triggered by git tags.
- Improved documentation with specific setup instructions for both Nominatim and Google providers.

## [0.1.0] - 2026-01-20

### Added
- **Initial Release**.
- Core `AddressKit` logic with provider factory.
- **Nominatim Provider**: Integration with OpenStreetMap's geocoding service.
- **Rate-Limiting**: Static request queue implementation to comply with OSM's 1 request/second policy.
- **LRU Cache**: Built-in memory cache with configurable TTL and least-recently-used eviction policy.
- Bilingual documentation (English and Spanish).
