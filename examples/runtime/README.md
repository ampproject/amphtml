# Runtime performance examples

This folder contains example pages owned by [@wg-performance](https://github.com/ampproject/wg-performance), and made for testing performance with `amp performance`

-   **images.html**: This page has 1000 images. It is a good stress test for the resources system as we want to ensure it prioritizes 1vp elements over other elements within the loadRect.
-   **list-always.html**: This page contains the slowest form of an `<amp-list>`, namely one with `binding="always"`.
-   **article.html**: Meant to be as similar to a standard AMP article as possible. Contains the most used components.
