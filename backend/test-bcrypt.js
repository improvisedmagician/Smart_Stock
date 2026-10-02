const bcrypt = require('bcrypt');
const hash = '$2b$10$EIXe0.EfGKz5xB6Q6xK6AeQYDB0VJ6Xz0jN5fGnE6S1z0LzRfhXCu';
bcrypt.compare('admin123', hash).then(res => console.log('Match:', res));
