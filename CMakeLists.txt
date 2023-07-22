cmake_minimum_required(VERSION 3.5)

project(long-kwin-plugins)

set(PROJECT_NAME "long-kwin")

set(CMAKE_INCLUDE_CURRENT_DIR ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTOUIC ON)
set(CMAKE_AUTORCC ON)

add_subdirectory(plugins)

install(FILES config/kglobalshortcutsrc DESTINATION /etc/xdg)
install(FILES config/kwinrc DESTINATION /etc/xdg)
install(FILES config/kwinrulesrc DESTINATION /etc/xdg)

install(DIRECTORY scripts/longlauncher DESTINATION /usr/share/kwin/scripts)
install(DIRECTORY scripts/long_squash DESTINATION /usr/share/kwin/effects)
install(DIRECTORY scripts/long_scale DESTINATION /usr/share/kwin/effects)
install(DIRECTORY scripts/long_popups DESTINATION /usr/share/kwin/effects)
install(DIRECTORY tabbox/long_thumbnail DESTINATION /usr/share/kwin/tabbox)
