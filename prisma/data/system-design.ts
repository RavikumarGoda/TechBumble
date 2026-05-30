export const systemDesign = [
  {
    title: "Design a URL Shortener (like Bitly)",
    description: "Design a URL shortening service that converts long URLs into short aliases. The service should handle 100M URLs with high read availability.",
    explanation: "Core components: API server, database (URLs table with short_code, long_url, created_at), cache (Redis for hot URLs), and ID generator. For short code generation, use base62 encoding of an auto-increment ID or MD5 hash (first 7 chars). Read:Write ratio is ~100:1 so cache aggressively. Use consistent hashing for horizontal scaling. Handle redirects with 301 (permanent) or 302 (temporary/analytics). Expiration support with TTL. CDN for geographically distributed redirects.",
    solution: "Components: Load Balancer -> API Servers -> Cache (Redis) -> DB (PostgreSQL). Schema: urls(id, short_code, long_url, user_id, created_at, expires_at, click_count). Short code: base62(auto_increment_id) gives 62^7 = 3.5T unique URLs. Cache: Redis with short_code as key, LRU eviction, TTL matching URL expiry. Scale: shard DB by short_code hash, replicate for read scaling. Analytics: async write to ClickHouse via message queue.",
    category: "System Design", difficulty: "Easy", companies: []
  },
  {
    title: "Design a Pastebin",
    description: "Design Pastebin where users can store plain text and get a unique URL to access it. Support text up to 10MB with optional expiration.",
    explanation: "Similar to URL shortener but stores content. Key difference: content can be large (up to 10MB) so store in object storage (S3) not DB. DB only stores metadata (paste_id, s3_key, created_at, expires_at, user_id, visibility). Generate unique paste_id using UUID or base62. For read-heavy workload, cache metadata in Redis. CDN for content delivery. Separate cleanup service to delete expired pastes from both S3 and DB.",
    solution: "Architecture: API -> Metadata DB (PostgreSQL) + Object Store (S3) + Cache (Redis). Schema: pastes(paste_id, s3_key, user_id, size_bytes, language, expires_at, visibility). Flow: POST /paste -> generate ID -> write content to S3 -> write metadata to DB -> return URL. GET /paste/{id} -> check cache -> if miss, query DB -> fetch from S3 -> cache result -> return content. Expiry: cron job scans expired pastes, deletes from S3 then DB.",
    category: "System Design", difficulty: "Easy", companies: []
  },
  {
    title: "Design a Rate Limiter",
    description: "Design a rate limiter that can be used as a middleware. Support per-user and per-IP limits. The system should handle 10K requests/second.",
    explanation: "Common algorithms: Token Bucket (smooth, allows bursts), Leaky Bucket (strict rate), Fixed Window Counter (simple, boundary spike issue), Sliding Window Log (accurate, memory heavy), Sliding Window Counter (good balance). For distributed systems, use Redis with atomic operations. Store counters in Redis with TTL. Use Lua scripts for atomic increment+check. Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. Return 429 Too Many Requests when exceeded.",
    solution: "Implementation: Redis INCR with TTL for Fixed Window. For Sliding Window: Redis sorted set with timestamps as scores, ZREMRANGEBYSCORE to remove old entries, ZADD + ZCOUNT for current window. Distributed: each API server talks to Redis cluster. Rules config: {endpoint, user_tier, limit, window}. Soft vs hard limits. Bypass for internal services. Key format: rate_limit:{user_id}:{endpoint}:{window_start}. Fallback: if Redis down, allow requests (fail open) or block (fail closed) based on SLA.",
    category: "System Design", difficulty: "Easy", companies: []
  },
  {
    title: "Design Twitter / X Timeline",
    description: "Design Twitter's home timeline feature. Users follow each other and see a feed of recent tweets from people they follow. Handle 200M daily active users.",
    explanation: "Two approaches: Fan-out on write (push model) vs fan-out on read (pull model). Push: when user tweets, write to all followers' timeline caches immediately. Fast reads, slow writes, problematic for celebrities (millions of followers). Pull: compute timeline on read from followees' tweets. Slow reads, fast writes. Hybrid: push for regular users (<10K followers), pull for celebrities. Merge both at read time. Store tweets in Cassandra (write-heavy, time-series). Cache timelines in Redis sorted sets.",
    solution: "Schema: tweets(tweet_id, user_id, content, created_at), follows(follower_id, followee_id). Timeline cache: Redis sorted set per user, score=timestamp, members=tweet_ids. Tweet content: separate service/cache. Hybrid fanout: check follower count on tweet creation. For regular users: fanout to all follower caches via message queue workers. For celebrities: pull their tweets at read time and merge with cache. Pagination: cursor-based using tweet_id. Search: Elasticsearch index. CDN for media.",
    category: "System Design", difficulty: "Medium", companies: []
  },
  {
    title: "Design Dropbox / Google Drive",
    description: "Design a cloud file storage service where users can upload, download, and sync files across devices. Handle 50M users with an average of 200 files each.",
    explanation: "Key challenges: large file uploads (chunking), sync across devices (conflict resolution), sharing with permissions. Chunk files into 4MB blocks for resumable uploads and deduplication. Store metadata (file tree, ownership, version) separately from content (S3). Sync protocol: client maintains local chunk hashes, sends delta to server. Block server deduplicates chunks using content-hash as key. Message queue notifies other clients of changes. WebSocket or long-polling for real-time sync.",
    solution: "Components: Client app, Block servers, Metadata servers, Notification service, S3 (block storage). Schema: files(file_id, name, path, owner_id, size, version), chunks(chunk_hash, s3_key, size), file_chunks(file_id, chunk_hash, sequence), shares(file_id, user_id, permission). Upload flow: client chunks file -> upload chunks to block server (dedup by hash) -> update metadata -> notify other clients. Download: fetch metadata -> get chunks -> reconstruct file. Delta sync: client tracks local state, only uploads changed chunks.",
    category: "System Design", difficulty: "Medium", companies: []
  },
  {
    title: "Design a Notification System",
    description: "Design a push notification system that sends notifications via SMS, email, and mobile push. Handle 10M notifications per day with delivery guarantees.",
    explanation: "Decouple notification creation from delivery using message queues. API server validates request and publishes to queue. Workers consume queue and call third-party providers (FCM for Android, APNs for iOS, Twilio for SMS, SendGrid for email). Handle retries with exponential backoff. Track delivery status. Rate limiting per user and per provider. Priority queues for urgent vs marketing notifications. Respect user preferences and opt-outs stored in DB.",
    solution: "Architecture: API -> Kafka (per channel topic) -> Worker pools -> Provider SDKs. Schema: notifications(id, user_id, type, content, status, retry_count, created_at), user_preferences(user_id, email_enabled, sms_enabled, push_enabled, quiet_hours). Workers: EmailWorker, SMSWorker, PushWorker each consuming from their Kafka topic. Retry: failed notifications go to retry topic with delay (1min, 5min, 30min). Status: PENDING -> SENT -> DELIVERED/FAILED. Dashboard for monitoring delivery rates.",
    category: "System Design", difficulty: "Medium", companies: []
  },
  {
    title: "Design a Web Crawler",
    description: "Design a web crawler that crawls the internet starting from seed URLs, fetches web pages, and stores their content for indexing. Handle 1B pages.",
    explanation: "Core loop: fetch URL -> parse HTML -> extract links -> add unvisited links to frontier -> store content. URL frontier: priority queue based on recency and importance. Robots.txt compliance: check before crawling any domain. Politeness: respect crawl-delay, one request per domain per few seconds. Deduplication: Bloom filter for URLs seen + content hashing to avoid storing duplicates. Distributed: multiple crawlers, partition URL space by domain hash. DNS caching to reduce lookups.",
    solution: "Components: URL Scheduler, Fetcher, Parser, Content Store, URL DB. URL Frontier: Redis priority queue with (priority, url). Fetcher: async HTTP client pool with timeout. DNS cache: local LRU cache of domain->IP. Robots.txt cache: per-domain, refresh weekly. Parser: HTML parser extracts links and content. Dedup: Bloom filter (URL seen) + MinHash/SimHash (content near-duplicate). Storage: raw HTML in S3, extracted text in Elasticsearch. Scale: 100 crawler workers, partition by URL hash.",
    category: "System Design", difficulty: "Medium", companies: []
  },
  {
    title: "Design Uber / Ride Sharing",
    description: "Design a ride-sharing backend where riders can request rides and drivers can accept them. Handle matching, real-time location tracking, and pricing.",
    explanation: "Key services: Location service (real-time driver positions), Matching service (find nearest available driver), Trip service (manage ride lifecycle), Pricing service (surge pricing), Notification service. Driver location updates every 4 seconds via WebSocket. Store in Redis geospatial index for fast nearest-driver queries. Matching: query Redis GEORADIUS, rank by proximity and rating. Surge pricing: monitor supply/demand ratio, adjust multiplier. Payments handled async post-trip.",
    solution: "Architecture: WebSocket servers for real-time comm, Location service with Redis GEO, Trip service with PostgreSQL, Matching service. Driver location: Redis GEOADD with driver_id and coords, TTL=60s (stale if not updated). Rider request: GEORADIUS to find drivers within 5km, sort by distance. Offer trip to closest driver, retry next if declined (30s timeout). Trip state machine: REQUESTED->ACCEPTED->ARRIVED->IN_PROGRESS->COMPLETED. Surge: ratio=(open_requests)/(available_drivers), multiplier = 1+0.5*max(0,ratio-1). ETA: Google Maps Distance Matrix API.",
    category: "System Design", difficulty: "Medium", companies: []
  },
  {
    title: "Design YouTube / Netflix",
    description: "Design a video streaming platform that allows users to upload and stream videos. Handle 500 hours of video uploaded per minute and 1B daily users.",
    explanation: "Video pipeline: Upload -> Transcoding (multiple resolutions) -> Storage (CDN) -> Stream. Adaptive bitrate streaming (HLS/DASH) adjusts quality based on bandwidth. Transcoding: GPU workers process video into 360p/480p/720p/1080p/4K. Store segments in S3, distribute via CDN. Metadata in PostgreSQL, search in Elasticsearch. Recommendations: ML model using watch history, collaborative filtering. Comments/Likes: separate high-write services. View counts: Redis counter with periodic flush to DB.",
    solution: "Components: Upload service, Transcoding pipeline (AWS MediaConvert/FFmpeg workers), CDN (CloudFront), Streaming service, Metadata service, Recommendation engine. Upload: multipart upload to S3, trigger transcoding via SQS. CDN: video segments cached at edge, 95% cache hit target. HLS manifest: lists available quality segments, player selects based on bandwidth. Database: video metadata in PostgreSQL, video segments path map in Redis. Analytics: Kafka -> Flink real-time -> ClickHouse for reporting. Thumbnail: extract frame at 5 seconds, auto-generate 3 options.",
    category: "System Design", difficulty: "Hard", companies: []
  },
  {
    title: "Design WhatsApp / Real-time Messaging",
    description: "Design a real-time messaging system supporting 1-on-1 and group chats. Handle 100B messages daily with end-to-end encryption and offline message delivery.",
    explanation: "Key challenges: message ordering, delivery guarantees, group messaging fan-out, online presence, offline queueing. WebSocket connections for real-time delivery. Message acknowledgments: sent, delivered, read receipts. Offline: store messages in DB until device reconnects. Group: fan-out to all members. End-to-end encryption: keys never on server, Signal Protocol. Presence: last seen updated on disconnect, visible to contacts. Media: store in S3 with 30-day TTL for forwarded media.",
    solution: "Architecture: WebSocket gateway (stateful, sticky sessions), Message service, Notification service, Media service, Group service. Message flow: Sender->WS Gateway->Message Service->DB+Queue. If recipient online: deliver via WS. If offline: push notification, store in offline queue. Schema: messages(id, chat_id, sender_id, content_encrypted, type, timestamp, status), chats(id, type, created_at), chat_members(chat_id, user_id, joined_at). Group fanout: async workers push to each member. Ordering: logical clock per chat. Read receipts: batch update every 5s.",
    category: "System Design", difficulty: "Hard", companies: []
  },
  {
    title: "Design a Distributed Cache (like Redis)",
    description: "Design a distributed in-memory key-value cache supporting GET, SET, DELETE operations with TTL and eviction policies. Handle 1M requests/second.",
    explanation: "Core features: O(1) get/set, TTL expiration, LRU eviction, persistence. Distributed: consistent hashing to shard keys across nodes, virtual nodes for balanced distribution. Replication: primary-replica for availability. Eviction policies: LRU (doubly linked list + hash map), LFU, TTL-based. Persistence: RDB snapshots and AOF (append-only file) for durability. Pub/sub for cache invalidation across nodes. Hot key problem: local cache layer or split key across multiple shards.",
    solution: "Data structure: Hash map (key->node in doubly linked list) + DLL (for LRU order). Cluster: consistent hash ring, each node owns a range. Virtual nodes (150 per physical) for even distribution. Replication: async replication to 2 replicas, quorum reads for consistency. Protocol: RESP (Redis Serialization Protocol), binary-safe. Persistence: RDB every 15min, AOF with fsync every second. Client: connection pooling, automatic retry with backoff, replica reads for GET. Monitoring: latency percentiles, hit rate, memory usage, eviction count.",
    category: "System Design", difficulty: "Hard", companies: []
  },
  {
    title: "Design a Search Autocomplete / Typeahead System",
    description: "Design a real-time search suggestion system that returns top 5 completions as users type. Handle 10M queries/second with sub-100ms response.",
    explanation: "Two components: data collection (log searches, count frequencies) and query serving (return top suggestions for prefix). Trie data structure for prefix matching but doesn't scale in distributed setting. Alternative: precompute top-k suggestions for all prefixes offline, store in key-value store. Update suggestions periodically (daily/hourly) via batch job analyzing query logs. Cache aggressively since prefix->suggestions mapping is read-heavy. CDN can cache at edge for popular prefixes.",
    solution: "Architecture: Query service (real-time), Aggregation service (batch), Storage (Redis/Trie). Query flow: user types 'a' -> check Redis key 'a' -> return cached top 5 suggestions. Cache: Redis ZSET per prefix, score=frequency, members=suggestions. Coverage: precompute for all prefixes up to length 10. Data collection: log all searches to Kafka, Spark job aggregates daily frequency, updates Redis. Freshness: suggestions updated every hour for trending, daily for stable. Personalization: blend global suggestions with user history. Geo: CDN caches hot prefixes at edge nodes.",
    category: "System Design", difficulty: "Medium", companies: []
  },
  {
    title: "Design a Distributed Message Queue (like Kafka)",
    description: "Design a distributed message queue supporting publish-subscribe with at-least-once delivery, message ordering per partition, and retention of 7 days.",
    explanation: "Core concepts: topics (logical channels), partitions (ordered, immutable log), producers (append to partition), consumers (track offset). Partitioning enables parallelism — messages with same key go to same partition (ordering guarantee). Consumer groups: each group processes all messages, each partition assigned to one consumer in group. Replication: each partition has one leader and N-1 followers. Leader handles reads/writes; followers replicate. ISR (In-Sync Replicas) for durability guarantee. Retention: delete messages older than 7 days or when disk limit hit.",
    solution: "Architecture: Brokers (Kafka nodes), ZooKeeper/KRaft (coordinator), Producers, Consumers. Storage: each partition is a segment file on disk, messages appended sequentially (fast I/O). Index file: offset->file position for O(1) message lookup. Producer: choose partition (round-robin or key hash), batch messages, async send. Consumer: poll model, commit offsets to __consumer_offsets topic. Replication: producer acks=all waits for all ISR, acks=1 waits for leader only. Zero-copy: sendfile() syscall bypasses user space. Compression: snappy/lz4 per batch.",
    category: "System Design", difficulty: "Hard", companies: []
  },
  {
    title: "Design Google Search",
    description: "Design the core components of Google Search — crawling, indexing, and query serving. Handle 8.5B searches per day.",
    explanation: "Three main systems: crawling (fetch web pages), indexing (build inverted index), serving (query processing and ranking). Inverted index: maps term->list of (doc_id, frequency, positions). PageRank: iterative algorithm computing page importance from link graph. Query processing: tokenize, stem, remove stop words, look up inverted index, intersect posting lists, rank results. Relevance: TF-IDF * PageRank * hundreds of other signals. Freshness: prioritize recently crawled pages. Spell correction: query rewriting using n-gram language model.",
    solution: "Pipeline: Crawler -> Doc store (HDFS) -> MapReduce indexer -> Inverted index (Bigtable) -> Query serving (custom in-memory). Crawl: 1000s of crawler machines, frontier queue, politeness rules. Index: MapReduce over crawl data, output inverted index shards. Serving: user query -> query parser -> inverted index lookup (multiple shards in parallel) -> doc scorer (TF-IDF, PageRank, freshness, click data) -> top-k ranker -> snippet generator -> result. Caching: query cache for hot queries, doc cache for popular pages. Geo: route to nearest data center.",
    category: "System Design", difficulty: "Hard", companies: ["Google"]
  },
  {
    title: "Design Facebook News Feed",
    description: "Design the Facebook News Feed that aggregates and ranks posts from a user's friends and pages they follow. Handle 2B users with personalized, ranked feeds.",
    explanation: "Feed generation: aggregate content from friends + pages, rank by ML model, paginate. Fan-out on write for regular users (precompute feed), fan-out on read for celebrities (pull at request time). Ranking signals: affinity (how close you are), weight (post type), time decay. Edge rank algorithm (simplified). Cache user's feed in Redis. Invalidate on new posts from friends. For read: merge precomputed feed with celebrity posts real-time. Privacy: filter posts based on audience settings at read time.",
    solution: "Components: Post service, Feed generation service, Feed cache (Redis), Ranking service, Notification service. Feed store: Redis list per user (last 1000 posts), sorted by rank score. Fan-out: on new post, async workers add post_id to followers' feed cache (skip if >5000 followers). Read path: get feed from Redis -> fetch post details in batch from Post service -> apply privacy filter -> return page. Ranking: ML model (Gradient Boosted Trees) scores each post, considers: time, engagement rate, post type, relationship strength. Pagination: offset-based with 25 posts per page.",
    category: "System Design", difficulty: "Hard", companies: ["Meta"]
  },
];
