#!/bin/bash

# Ensure .env exists, and add default lines if it doesn't
if [ ! -f .env ]; then
  echo "Creating .env file with default values..."
  cat <<EOL >> .env
API_URL=http://localhost:3000
BLUESKY_PRIVATE_KEY_1=''
BLUESKY_PRIVATE_KEY_2=''
BLUESKY_PRIVATE_KEY_3=''
BLUESKY_JWT_SECRET=''
EOL
else
  echo ".env file already exists."
  # Ensure BLUESKY_PRIVATE_KEY_1, BLUESKY_PRIVATE_KEY_2, BLUESKY_PRIVATE_KEY_3, and BLUESKY_JWT_SECRET exist
  grep -q "BLUESKY_PRIVATE_KEY_1" .env || echo "BLUESKY_PRIVATE_KEY_1=''" >> .env
  grep -q "BLUESKY_PRIVATE_KEY_2" .env || echo "BLUESKY_PRIVATE_KEY_2=''" >> .env
  grep -q "BLUESKY_PRIVATE_KEY_3" .env || echo "BLUESKY_PRIVATE_KEY_3=''" >> .env
  grep -q "BLUESKY_JWT_SECRET" .env    || echo "BLUESKY_JWT_SECRET=''" >> .env
fi

# Generate private/public keys and inject into the .env file
for i in {1..3}; do
  PRIVATE_KEY_FILE="private_key_$i.pem"
  PUBLIC_KEY_FILE="public_key_$i.pem"

  # Generate the private key
  openssl genpkey -algorithm RSA -out $PRIVATE_KEY_FILE -pkeyopt rsa_keygen_bits:2048

  # Extract the public key and store it in a file
  openssl rsa -pubout -in $PRIVATE_KEY_FILE -out $PUBLIC_KEY_FILE

  # Format the private key to be a single line for .env
  PRIVATE_KEY_CONTENT=$(awk 'NF {gsub(/\n/, ""); printf "%s", $0;}' $PRIVATE_KEY_FILE)
  sed -i '' "s|BLUESKY_PRIVATE_KEY_$i=''|BLUESKY_PRIVATE_KEY_$i=$PRIVATE_KEY_CONTENT|" .env
done

# Generate JWT_SECRET and inject into .env
JWT_SECRET=$(openssl rand -base64 32)
sed -i '' "s|BLUESKY_JWT_SECRET=''|BLUESKY_JWT_SECRET=$JWT_SECRET|" .env

echo "Keys and JWT secret have been added to .env successfully."
echo "Public keys are stored as public_key_1.pem, public_key_2.pem, public_key_3.pem in the current directory."
