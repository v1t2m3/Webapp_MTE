# Bug Report: Equipment Form Not Saving

1. **Add Equipment Bug**: 
   When submitting a new equipment via `equipment-form.tsx`, no `id` is provided in the frontend `data` payload. While `googleSheetsService.addEquipment` *does* generate a fallback `id` (`EQ-${Date.now()}`), the API route `POST /api/equipments` does not return the newly generated ID or correctly handle revalidation. Also, looking closely at Google Sheets service, `getEquipments` strictly matches the Google Sheet name. The sheet is named `Equipments `, with a trailing space in the code `Equipments !A:I`. This is fragile and can easily break if the sheet name is corrected in Google Sheets.

2. **Edit Equipment Bug**: 
   In `googleSheetsService.updateEquipment`, the backend finds the exact row index of the equipment. However, when it writes back the updated row, it writes to `Equipments !A${rowIndex}:I${rowIndex}`. If there's any mismatch between the payload shape and what the update function expects, or if the user removed the trailing space in the Google Sheet's tab name (`Equipments` vs `Equipments `), it will fail silently.

3. **Status Field Fallback**: 
   The form handles fallback status values (e.g., "Broken" vs "Đang hỏng") but might not be passing the correct Vietnamese string back to the API exactly as the Sheet expects, or the Sheet has strict validation.

### Proposed Fixes:
1.  **Frontend**: Auto-generate `id` in frontend if it's missing during `POST` so the frontend knows what ID was created, OR fix the backend `POST` to return the created ID. (Generating `EQ-${Date.now()}` in the form submit is safer).
2. **Sheet Reference**: I will adjust `lib/google-sheets.ts` to ensure it targets `Equipments` without the trailing space if the sheet name was renamed (though `Equipments ` works, it's safer to check).
3. **API Routing**: We will add a quick fallback error log in `/api/equipments/route.ts` and `[id]/route.ts` to log *why* the `dataService` failed instead of a silent 500.

Please confirm if you would like me to proceed with implementing these fixes in the code.
