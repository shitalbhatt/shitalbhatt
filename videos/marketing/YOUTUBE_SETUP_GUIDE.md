# YouTube setup guide: two ways to upload all 37 videos (+ 37 Shorts)

## Important caveat (read first)
Google's `videos.insert` documentation says videos uploaded through the API from an **unverified API project created after 28 July 2020 are restricted to private viewing mode** until the project passes a YouTube API compliance audit. So the script and the Colab notebook may upload your videos fine but leave them locked private. **Test with one video first** (set the limit to 1). If you can make it public in YouTube Studio, continue. If not, use Option A.

## Option A: YouTube Studio (always works, no code)
1. Create your 4 playlists: Studio → Content → Playlists → New playlist (names are in `LAUNCH_GUIDE.md`).
2. Studio → Create → Upload videos. Select 5-10 MP4s at a time.
3. For each video, copy the title and description from `upload_manifest_with_schedule.json` (or the calendar).
4. Under **Customization**: upload the matching thumbnail, add the playlist, and answer "Altered or synthetic content: yes".
5. Under **Visibility**: choose **Schedule** and enter the date and time from `publishing_calendar.csv`.
6. After upload, open the video → Subtitles → Add language English → Upload file, and pick the matching `.srt`.
7. Upload the 37 Shorts the same way (vertical videos under 60 seconds become Shorts), using `shorts_manifest.json` titles and dates.
Tip: YouTube Studio limits how many videos you can upload per day on a new channel; if it asks you to verify your phone, do it at youtube.com/verify, which also unlocks custom thumbnails.

## Option B: Google Colab notebook (automatic, may stay private, see caveat)
1. **Drive:** put the unzipped files in `MyDrive/DATA209_upload` (MP4s, SRTs, `thumbs/`, `upload_manifest.json`) and the Shorts in `MyDrive/DATA209_upload/shorts`.
2. **Google Cloud (once):**
   - Go to console.cloud.google.com, create a project.
   - APIs & Services → Library → search **YouTube Data API v3** → Enable.
   - Configure the OAuth consent screen (user type External), and add your own Google account under **Test users**.
   - APIs & Services → Credentials → Create credentials → OAuth client ID → Application type **TVs and Limited Input devices**. Copy the Client ID and Client secret. (Menu names change from time to time.)
3. **Colab:** open `colab_upload_to_youtube.ipynb` at colab.research.google.com and run the cells in order. In the sign-in cell, open google.com/device, enter the code, and choose the Google account that owns your YouTube channel.
4. **Test:** keep `LIMIT = 1`, run the upload cell, then check the video in YouTube Studio and try to set it to public.
5. If it works, raise `LIMIT` and run the cell once a day. If a quota error appears, wait until the next day. Check your quota under Cloud console → APIs & Services → YouTube Data API v3 → Quotas, since the cost per upload is stated differently in different sources.
6. Optional: run the last cell for the Shorts.

## Keep your account safe
- Never share your Google password or sign-in codes with anyone, including AI assistants.
- Keep the Client secret private. Delete the Cloud project's credentials when you finish uploading.
