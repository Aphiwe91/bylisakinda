# AP Global Organics — static site served by nginx
FROM nginx:alpine

# Copy site files
COPY . /usr/share/nginx/html

# Remove files not needed in production
RUN rm -rf /usr/share/nginx/html/tests \
           /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/.git* \
           /usr/share/nginx/html/README*

# Nginx config for SPA-like behavior (optional, but handles refresh)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]