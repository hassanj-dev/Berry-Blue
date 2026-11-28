-- Admin-uploaded thumbnails are larger now (up to 1200 px), so the 1 MB bucket limit is raised to 2 MB.
update storage.buckets set file_size_limit = 2097152 where id = 'thumbnails';
