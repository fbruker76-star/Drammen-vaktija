# Drammen Vaktija PWA

This is an installable web app for Samsung/Android.

## Data updates
Prayer times are stored separately in `timetable.json`.
When a new monthly timetable is available, add entries in the format:

"YYYY-MM-DD": ["Zora","Izlazak sunca","Podne","Ikindija","Akšam","Jacija"]

Example:
"2026-10-01": ["05:22","07:25","13:13","15:59","18:57","20:45"]

## Hosting
A PWA must be served over HTTPS (or localhost during testing). Upload the folder contents to any HTTPS static host.

Then open the site in Samsung Internet or Chrome and choose **Add page to / Add to Home screen** or **Install app**.

## Current timetable
September 2026 is included from the timetable image supplied in the conversation.
