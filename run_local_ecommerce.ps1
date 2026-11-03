# PowerShell script to set up and run the fruits‑and‑vegetables e‑commerce backend locally
# File: h:/HARI/AWS project/run_local_ecommerce.ps1
# ------------------------------------------------------------
# 1. Resolve the user‑scripts folder where pip installed SAM (sam.exe)
$pythonScripts = & python -c "import site, os; print(os.path.join(site.getusersitepackages(), '..', 'Scripts'))"
$pythonScripts = $pythonScripts.Trim()
Write-Host "Adding $pythonScripts to PATH..."
$env:Path += ";$pythonScripts"

# 2. Verify SAM CLI is available
Write-Host "Checking SAM CLI version..."
try {
    sam --version
} catch {
    Write-Error "SAM CLI not found even after updating PATH. Please ensure $pythonScripts contains sam.exe"
    exit 1
}

# 3. Train the model (uploads to S3 bucket you already created)
Write-Host "Running model training..."
python train_model.py
if ($LASTEXITCODE -ne 0) {
    Write-Error "Model training failed. Check train_model.py output."
    exit 1
}

# 4. Build the SAM application
Write-Host "Building SAM application..."
sam build
if ($LASTEXITCODE -ne 0) {
    Write-Error "sam build failed."
    exit 1
}

# 5. Start the local API in a separate background PowerShell job
Write-Host "Starting SAM local API (http://127.0.0.1:3000)..."
function Start-DynamoDBLocal {
    $containerName = "local-dynamodb"
    $running = docker ps --filter "name=$containerName" --format "{{.Names}}"
    if (-not $running) {
        Write-Host "Starting DynamoDB Local container..."
        docker run -d --name $containerName -p 8000:8000 amazon/dynamodb-local
        # Give it a moment to initialise
        Start-Sleep -Seconds 5
    } else {
        Write-Host "DynamoDB Local already running."
    }
}
Start-DynamoDBLocal
# Wait for DynamoDB to become responsive by trying a ListTables call
while ($true) {
    try {
        aws dynamodb list-tables --endpoint-url http://localhost:8000 --output json | Out-Null
        Write-Host "DynamoDB is ready."
        break
    } catch {
        Start-Sleep -Seconds 2
    }
}

# 6. Seed the DynamoDB table (local endpoint)
# Adjust the table name if you changed it in template.yaml
$tableName = "f2c-single-table"
$endpoint = "http://localhost:8000"
Write-Host "Seeding product catalogue (fruits & vegetables)..."
# Apple
$item = @{ pk = @{ S = "PRODUCT#FRUIT" }; sk = @{ S = "FRUIT#APPLE" }; type = @{ S = "product" }; name = @{ S = "Apple" }; category = @{ S = "fruit" }; price = @{ N = "2.5" } } | ConvertTo-Json -Compress; aws dynamodb put-item --table-name $tableName --endpoint-url $endpoint --item "$item"
# Banana
$item = @{ pk = @{ S = "PRODUCT#FRUIT" }; sk = @{ S = "FRUIT#BANANA" }; type = @{ S = "product" }; name = @{ S = "Banana" }; category = @{ S = "fruit" }; price = @{ N = "1.8" } } | ConvertTo-Json -Compress; aws dynamodb put-item --table-name $tableName --endpoint-url $endpoint --item "$item"
# Carrot
$item = @{ pk = @{ S = "PRODUCT#VEGGIE" }; sk = @{ S = "VEGGIE#CARROT" }; type = @{ S = "product" }; name = @{ S = "Carrot" }; category = @{ S = "vegetable" }; price = @{ N = "0.9" } } | ConvertTo-Json -Compress; aws dynamodb put-item --table-name $tableName --endpoint-url $endpoint --item "$item"
# Tomato
$item = @{ pk = @{ S = "PRODUCT#VEGGIE" }; sk = @{ S = "VEGGIE#TOMATO" }; type = @{ S = "product" }; name = @{ S = "Tomato" }; category = @{ S = "vegetable" }; price = @{ N = "1.2" } } | ConvertTo-Json -Compress; aws dynamodb put-item --table-name $tableName --endpoint-url $endpoint --item "$item"

Write-Host "Seeding complete."

# 7. Test the inference endpoint (local)
Write-Host "Testing /infer endpoint..."
$payload = '{"commodity":"Wheat","district":"North","arrival_qty":200,"cpi_inflation_index":105,"fuel_price_index":75,"seasonality":1.0}'
$headers = @{'Content-Type'='application/json'}; Invoke-WebRequest -Uri http://127.0.0.1:3000/infer -Method POST -Headers $headers -Body $payload | Select-Object -ExpandProperty Content

Write-Host "---\nAll done! The API is still running in the background (PowerShell Job $($apiJob.Id)).\nTo stop it, run: Stop-Job $($apiJob.Id) or close this PowerShell window."
