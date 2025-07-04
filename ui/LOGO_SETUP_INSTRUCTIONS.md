# Nivra Logo Installation Instructions

## To add the Nivra logo to your website:

1. **Save the logo image**: 
   - Save the provided Nivra logo image as `nivra-logo.png` in the `public` folder of your project
   - The path should be: `c:\Users\srivastavar\Documents\workspace\Nivra\ui\public\nivra-logo.png`

2. **Logo specifications**:
   - The logo will be displayed at 32x32 pixels in the header
   - The image should be in PNG format for best quality with transparency
   - The logo features the Nivra brand design with a house and circuit pattern symbolizing smart housing community management

3. **Current implementation**:
   - The header component has been updated to use the new logo
   - Replaced the Material-UI ApartmentIcon with the custom Nivra logo
   - Added proper CSS styling for responsive display
   - The logo is positioned next to the "Nivra" text in the header

4. **Changes made**:
   - Updated `Header.tsx` to use the new logo image
   - Added CSS class `.nivra-logo` for proper styling
   - Removed unused Material-UI icon import
   - Cleaned up unused code and imports

## File locations updated:
- `src/components/Header.tsx` - Updated to use new logo
- `src/components/Header.css` - Added logo styling
- `public/nivra-logo.png` - (You need to manually add this file)

The logo will automatically appear in the header once you save the image file to the correct location.
