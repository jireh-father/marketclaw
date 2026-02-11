#!/usr/bin/env node
// Publishes to Hashnode via GraphQL API
// Env: HASHNODE_PAT, HASHNODE_PUBLICATION_ID
// Stdin: JSON {title, content, tags, slug, status}
// Stdout: JSON {url, post_id, status, platform}

const https = require('https');

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const payload = JSON.parse(input);
  const pat = process.env.HASHNODE_PAT;
  const pubId = process.env.HASHNODE_PUBLICATION_ID;

  if (!pat || !pubId) {
    console.error(JSON.stringify({ error: 'Missing HASHNODE_PAT or HASHNODE_PUBLICATION_ID', platform: 'hashnode' }));
    process.exit(1);
  }

  const tags = (payload.tags || []).map(t => ({ slug: t.toLowerCase().replace(/\s+/g, '-'), name: t }));

  const query = `mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post { id url title slug }
    }
  }`;

  const variables = {
    input: {
      publicationId: pubId,
      title: payload.title,
      contentMarkdown: payload.content,
      tags: tags.slice(0, 5),
      slug: payload.slug || undefined
    }
  };

  const body = JSON.stringify({ query, variables });

  const req = https.request({
    hostname: 'gql.hashnode.com',
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': pat,
      'Content-Length': Buffer.byteLength(body)
    }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.data && result.data.publishPost) {
          const post = result.data.publishPost.post;
          console.log(JSON.stringify({
            url: post.url,
            post_id: post.id,
            status: 'published',
            platform: 'hashnode'
          }));
        } else {
          console.error(JSON.stringify({
            error: result.errors ? result.errors[0].message : 'Unknown error',
            platform: 'hashnode'
          }));
          process.exit(1);
        }
      } catch (e) {
        console.error(JSON.stringify({ error: e.message, platform: 'hashnode' }));
        process.exit(1);
      }
    });
  });

  req.on('error', e => {
    console.error(JSON.stringify({ error: e.message, platform: 'hashnode' }));
    process.exit(1);
  });

  req.write(body);
  req.end();
});
