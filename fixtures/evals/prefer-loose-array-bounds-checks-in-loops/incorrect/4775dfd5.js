// Example 11: Using strict equality in a loop that dynamically updates the array
let s = 0
while (s !== dynamicArray.length) {
  // This can lead to infinite loops if elements are added to the array within the loop
  dynamicArray.push(s)
  console.log(dynamicArray[s])
  s++
}

// Generated by gpt-4-0125-preview
