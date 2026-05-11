Add-Type -AssemblyName System.Drawing
Get-ChildItem 'c:\Users\deluxXe\Documents\reencuentro\garden-web\public\assets' -Recurse -Include *.png,*.jpeg,*.jpg | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    "$($_.Name) => $($img.Width)x$($img.Height)"
    $img.Dispose()
}
