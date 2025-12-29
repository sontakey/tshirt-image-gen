module.exports = {
  apps: [{
    name: 'tshirt-image-gen',
    script: 'dist/index.js',
    cwd: '/home/ubuntu/tshirt-image-gen',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/home/ubuntu/tshirt-image-gen/logs/error.log',
    out_file: '/home/ubuntu/tshirt-image-gen/logs/out.log',
    log_file: '/home/ubuntu/tshirt-image-gen/logs/combined.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
