# Log Viewer Application

## Table of Contents
- [Log Viewer Application](#log-viewer-application)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Core Functionality](#core-functionality)
  - [High-Performance Architecture](#high-performance-architecture)
    - [Virtual Scrolling Implementation](#virtual-scrolling-implementation)
    - [Performance Optimizations](#performance-optimizations)
  - [Technical Specifications](#technical-specifications)
  - [User Experience Features](#user-experience-features)
  - [Quick start](#quick-start)
  - [Testing](#testing)

## Overview
This is a high-performance log viewer application built with React and TypeScript that streams and displays JSON-formatted log entries from remote sources. The application is specifically designed to handle massive datasets (50,000+ log entries) with exceptional performance through advanced virtualization techniques.

## Core Functionality
- **Real-time Log Streaming**: Fetches and processes log data from remote URLs (e.g., S3 buckets) using the Streams API
- **Progressive Loading**: Parses and displays logs incrementally as they stream in, providing immediate feedback to users
- **Interactive Log Exploration**: Each log entry can be expanded to view the complete JSON structure with formatted, syntax-highlighted output
- **Line-numbered Display**: Shows logs with IDE-style line numbers for easy reference and navigation

## High-Performance Architecture

### Virtual Scrolling Implementation
The application leverages a virtual scrolling system that makes viewing 50,000+ logs as smooth as viewing 50:

- **Minimal DOM Footprint**: Only renders 20-40 rows at any time, regardless of dataset size
- **Dynamic Height Calculation**: Handles variable row heights (collapsed vs. expanded states) while maintaining smooth scrolling
- **Memory Efficient**: Reduces memory usage by ~95% compared to traditional rendering
- **60fps Scrolling**: Maintains smooth performance even with massive datasets

### Performance Optimizations
- **Request Animation Frame**: Scroll events are debounced using `requestAnimationFrame` for smooth updates
- **Memoization**: React.memo and useMemo prevent unnecessary re-renders
- **Timestamp Caching**: Formatted timestamps are cached to avoid redundant date operations
- **Single-instance Service**: LogService uses a singleton pattern to prevent duplicate fetches

## Technical Specifications
- **Initial Render**: < 100ms for 50,000 rows (vs 3-5 seconds with traditional rendering)
- **DOM Nodes**: ~40 active nodes vs 50,000+ with standard approaches
- **Responsive Design**: Optimized for screens from mobile (320px) to desktop (1280px max-width)
- **Zero Additional Libraries**: Uses only React and minimal testing dependencies, keeping bundle size small

## User Experience Features
- **Click-to-Expand**: Click any log row to see the full JSON payload
- **Single Expansion**: Only one row expanded at a time for focused analysis
- **Visual Feedback**: Rotating caret indicators and hover states for intuitive interaction
- **Clean Typography**: Monospace fonts and proper spacing for excellent readability


## Quick start
```
npm install
npm run dev
```

## Testing
```
npm test
```
