sudo apt-get install wget &&
LATEST_VERSION=76.0.3809.68 &&
wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/$LATEST_VERSION/chromedriver_linux64.zip &&
sudo unzip /tmp/chromedriver.zip chromedriver -d /usr/local/bin/