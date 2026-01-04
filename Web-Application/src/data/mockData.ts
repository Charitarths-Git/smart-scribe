import { Institute, Course, Lecture, LectureContent } from '../types';

export const institutes: Institute[] = [
  { id: 'iit-mandi', name: 'IIT Mandi', logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop' },
  { id: 'iit-roorkee', name: 'IIT Roorkee', logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&h=100&fit=crop' },
  { id: 'iit-delhi', name: 'IIT Delhi', logo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=100&h=100&fit=crop' },
  { id: 'iisc', name: 'IISc Bangalore', logo: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=100&h=100&fit=crop' },
  { id: 'nit-trichy', name: 'NIT Trichy', logo: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=100&h=100&fit=crop' },
  { id: 'nit-warangal', name: 'NIT Warangal', logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&h=100&fit=crop' },
  { id: 'aiims-delhi', name: 'AIIMS Delhi', logo: 'https://via.placeholder.com/100' },
  { id: 'iisc-bangalore', name: 'IISC Bangalore', logo: 'https://via.placeholder.com/100' },
  { id: 'iiit-delhi', name: 'IIIT Delhi', logo: 'https://via.placeholder.com/100' },
  { id: 'dtu', name: 'DTU', logo: 'https://via.placeholder.com/100' },
];

export const courses: Course[] = [
  { id: 'ic-252', code: 'IC-252', name: 'Digital Signal Processing', professor: 'Dr. Rajesh Kumar' },
  { id: 'ic-112', code: 'IC-112', name: 'Data Structures & Algorithms', professor: 'Dr. Priya Sharma' },
  { id: 'ic-256', code: 'IC-256', name: 'Machine Learning', professor: 'Dr. Amit Patel' },
  { id: 'dc-256', code: 'DC-256', name: 'Computer Networks', professor: 'Dr. Sanjay Verma' },
  { id: 'ic-301', code: 'IC-301', name: 'Artificial Intelligence', professor: 'Dr. Neha Singh' },
  { id: 'dc-202', code: 'DC-202', name: 'Database Management Systems', professor: 'Dr. Rahul Mehta' },
];

export const lectures: Record<string, Lecture[]> = {
  'ic-252': [
    { id: 'ic252-l1', number: 1, date: '2025-01-15', topic: 'Introduction to Digital Signals', courseId: 'ic-252' },
    { id: 'ic252-l2', number: 2, date: '2025-01-17', topic: 'Fourier Transform Fundamentals', courseId: 'ic-252' },
    { id: 'ic252-l3', number: 3, date: '2025-01-20', topic: 'Z-Transform and Its Applications', courseId: 'ic-252' },
    { id: 'ic252-l4', number: 4, date: '2025-01-22', topic: 'FIR Filter Design', courseId: 'ic-252' },
    { id: 'ic252-l5', number: 5, date: '2025-01-24', topic: 'IIR Filter Design', courseId: 'ic-252' },
  ],
  'ic-112': [
    { id: 'ic112-l1', number: 1, date: '2025-01-16', topic: 'QuickSort Algorithm - Complete Analysis', courseId: 'ic-112' },
    { id: 'ic112-l2', number: 2, date: '2025-01-18', topic: 'Stacks and Queues', courseId: 'ic-112' },
    { id: 'ic112-l3', number: 3, date: '2025-01-21', topic: 'Trees and Binary Search Trees', courseId: 'ic-112' },
    { id: 'ic112-l4', number: 4, date: '2025-01-23', topic: 'Graph Algorithms', courseId: 'ic-112' },
    { id: 'ic112-l5', number: 5, date: '2025-01-25', topic: 'Dynamic Programming', courseId: 'ic-112' },
  ],
  'ic-256': [
    { id: 'ic256-l1', number: 1, date: '2025-01-14', topic: 'Introduction to Machine Learning', courseId: 'ic-256' },
    { id: 'ic256-l2', number: 2, date: '2025-01-16', topic: 'Linear Regression', courseId: 'ic-256' },
    { id: 'ic256-l3', number: 3, date: '2025-01-19', topic: 'Logistic Regression & Classification', courseId: 'ic-256' },
    { id: 'ic256-l4', number: 4, date: '2025-01-21', topic: 'Neural Networks Basics', courseId: 'ic-256' },
    { id: 'ic256-l5', number: 5, date: '2025-01-23', topic: 'Backpropagation Algorithm', courseId: 'ic-256' },
  ],
  'dc-256': [
    { id: 'dc256-l1', number: 1, date: '2025-01-15', topic: 'OSI Model & Network Layers', courseId: 'dc-256' },
    { id: 'dc256-l2', number: 2, date: '2025-01-17', topic: 'TCP/IP Protocol Suite', courseId: 'dc-256' },
    { id: 'dc256-l3', number: 3, date: '2025-01-20', topic: 'Routing Algorithms', courseId: 'dc-256' },
  ],
};

export const lectureContents: Record<string, LectureContent> = {
  'ic112-l1': {
    lectureId: 'ic112-l1',
    topic: 'QuickSort Algorithm - Complete Analysis',
    definition: 'QuickSort is a divide-and-conquer sorting algorithm that selects a pivot element, partitions the array into elements less than the pivot and elements greater than the pivot, and recursively sorts the partitions. It is typically implemented in-place and has average time complexity O(n log n) and worst-case O(n²).',
    recordingUrl: 'https://example.com/quicksort-lecture',
    bookReference: 'Introduction to Algorithms (CLRS) - Chapter 7: QuickSort, Pages 170-190 | Algorithms by Robert Sedgewick - Chapter 2.3, Pages 288-298',
    content: [
      {
        id: 'qs1',
        type: 'concept',
        title: '00:00–05:00 — Overview and Intuition',
        content: `QuickSort is one of the most important sorting algorithms in computer science. The fundamental idea is beautifully simple yet powerful: pick a pivot element, partition the array around that pivot so the pivot ends up in its final sorted position, then recursively sort the left and right sides.

This is classic divide-and-conquer strategy: split the work into smaller problems, solve them independently, and combine with trivial effort (no expensive merge step like in MergeSort).

The heavy lifting happens during partitioning, which is a linear O(n) operation for each segment. The efficiency of QuickSort depends heavily on how balanced the partitions are.`,
        timestamp: '00:00–05:00',
        professorNote: 'QuickSort idea: pick a pivot, partition around pivot so pivot is in final place, recursively sort left and right sides. This is like quick divide-and-conquer: split work, solve smaller problems, combine trivial (no expensive combine step). The heavy lifting is partitioning, which is linear in the segment length.',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop',
        imageCaption: 'Slide img23-1: QuickSort overview — diagram showing array, chosen pivot, left partition smaller, right partition larger; arrows leading to recursive calls',
        bookReference: 'CLRS Chapter 7.1, Pages 170-171 - QuickSort Overview'
      },
      {
        id: 'qs2',
        type: 'algorithm',
        title: '05:00–12:00 — Pseudocode and Partition (Lomuto Scheme)',
        content: `Here's the complete QuickSort algorithm with Lomuto partition scheme:

QuickSort(A, lo, hi):
    if lo < hi:
        p = Partition(A, lo, hi)   # p is pivot final index
        QuickSort(A, lo, p-1)      # Recursively sort left
        QuickSort(A, p+1, hi)      # Recursively sort right

Partition(A, lo, hi):  # Lomuto partition scheme
    pivot = A[hi]              # Choose last element as pivot
    i = lo - 1                 # Pointer for smaller elements
    for j = lo to hi-1:
        if A[j] <= pivot:
            i = i + 1
            swap A[i], A[j]    # Move smaller element forward
    swap A[i+1], A[hi]         # Place pivot in correct position
    return i+1                 # Return pivot's final position

The Partition function does all the work: it rearranges the array so all elements ≤ pivot are on the left, and all elements > pivot are on the right. After partition, the pivot is in its final sorted position.`,
        timestamp: '05:00–12:00',
        professorNote: 'Partition moves elements ≤ pivot to front and greater ones after. After partition, pivot at index p has every element left ≤ pivot and right ≥ pivot.',
        image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=600&fit=crop',
        imageCaption: 'Slide img23-2: Step-by-step Lomuto partition run on [3,7,8,5,2,1,9,5,4] showing pointer movements and swaps',
        animation: {
          id: 'anim-partition',
          title: 'Lomuto Partition Animation',
          description: 'Interactive step-by-step visualization of the Lomuto partition scheme showing how elements are compared and swapped. Watch the i and j pointers move through the array.',
          thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=400&fit=crop',
          type: 'interactive'
        },
        bookReference: 'CLRS Chapter 7.1, Pages 171-173 - Partition Algorithm'
      },
      {
        id: 'qs3',
        type: 'example',
        title: '12:00–25:00 — Worked Example (Detailed Trace)',
        content: `Let's trace QuickSort step-by-step on the array: A = [3, 7, 8, 5, 2, 1, 9, 5, 4]

INITIAL CALL: QuickSort(A, 0, 8)

Step 1: Partition with pivot = 4 (A[8] = 4)
Initialize: i = -1, pivot = 4

j=0: A[0]=3 ≤ 4 → i=0, swap A[0]↔A[0] → [3,7,8,5,2,1,9,5,4]
j=1: A[1]=7 > 4 → no swap
j=2: A[2]=8 > 4 → no swap
j=3: A[3]=5 > 4 → no swap
j=4: A[4]=2 ≤ 4 → i=1, swap A[1]↔A[4] → [3,2,8,5,7,1,9,5,4]
j=5: A[5]=1 ≤ 4 → i=2, swap A[2]↔A[5] → [3,2,1,5,7,8,9,5,4]
j=6: A[6]=9 > 4 → no swap
j=7: A[7]=5 > 4 → no swap

Final: swap pivot A[8] with A[i+1]=A[3] → [3,2,1,4,7,8,9,5,5]
Pivot position p = 3

Result: [3,2,1 | 4 | 7,8,9,5,5]
        Left        Right
        
Now recursively sort:
• QuickSort(A, 0, 2) on [3,2,1]
• QuickSort(A, 4, 8) on [7,8,9,5,5]

The recursion continues until all subarrays have size 0 or 1, which are trivially sorted.`,
        timestamp: '12:00–25:00',
        professorNote: 'Now QuickSort left [3,2,1] and right [7,8,9,5,5]. Continue recursively; you\'ll see it finishes in a few recursions.',
        animation: {
          id: 'anim-quicksort-trace',
          title: 'QuickSort Full Trace Animation',
          description: 'Complete animated walkthrough of QuickSort on the example array, showing all recursive calls, partition operations, and how the array gradually becomes sorted.',
          thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
          type: 'interactive'
        },
        bookReference: 'CLRS Chapter 7.1, Pages 172-174 - Partition Example'
      },
      {
        id: 'qs4',
        type: 'proof',
        title: '25:00–35:00 — Correctness Argument (Loop Invariants)',
        content: `We prove QuickSort's correctness using loop invariants and mathematical induction.

PARTITION CORRECTNESS:

Loop Invariant: At the start of each iteration of the for loop (lines with j), the following holds:
1. All elements in A[lo..i] are ≤ pivot
2. All elements in A[i+1..j-1] are > pivot
3. A[hi] = pivot (unchanged)

Initialization: Before first iteration, i = lo-1, so A[lo..i] is empty (vacuously true). A[i+1..j-1] is empty (j=lo), also vacuously true.

Maintenance: If A[j] ≤ pivot, we increment i and swap A[i]↔A[j], maintaining that A[lo..i] contains only elements ≤ pivot. If A[j] > pivot, we just increment j, adding A[j] to the > pivot region.

Termination: When j = hi, all elements except pivot have been classified. The final swap places pivot at position i+1, with all left elements ≤ pivot and all right elements > pivot.

QUICKSORT CORRECTNESS (by Induction):

Base Case: Arrays of size 0 or 1 are already sorted (trivial).

Inductive Step: Assume QuickSort correctly sorts all arrays of size < n. For array of size n:
1. Partition places pivot in correct final position
2. Recursively sort left subarray (size < n) — correct by IH
3. Recursively sort right subarray (size < n) — correct by IH
4. Combined result is fully sorted

Therefore, QuickSort correctly sorts any array.`,
        timestamp: '25:00–35:00',
        professorNote: 'Proof of correctness uses loop invariants for Partition and induction for recursion.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=600&fit=crop',
        imageCaption: 'Slide img23-3: Recursive invariants & illustration showing inductive proof structure',
        bookReference: 'CLRS Chapter 7.1, Pages 174-175 - Correctness of Partition'
      },
      {
        id: 'qs5',
        type: 'proof',
        title: '35:00–45:00 — Worst-Case Time Complexity O(n²)',
        content: `The worst case occurs when partitioning is maximally unbalanced at every recursive level.

WORST-CASE SCENARIO:
• Array is already sorted (or reverse sorted)
• Pivot chosen is always the smallest (or largest) element
• One partition has 0 elements, the other has n-1 elements

RECURRENCE RELATION:
T(n) = T(0) + T(n-1) + Θ(n)
     = T(n-1) + Θ(n)

where Θ(n) is the time for partition operation.

SOLVING BY EXPANSION:
T(n) = T(n-1) + cn
     = [T(n-2) + c(n-1)] + cn
     = T(n-2) + c(n-1) + cn
     = T(n-3) + c(n-2) + c(n-1) + cn
     ...
     = T(0) + c·1 + c·2 + c·3 + ... + c·n
     = c(1 + 2 + 3 + ... + n)
     = c·n(n+1)/2
     = Θ(n²)

CONCLUSION: Worst-case time complexity is O(n²).

This happens rarely in practice but is theoretically possible. Randomized pivot selection makes this worst case extremely unlikely.`,
        timestamp: '35:00–45:00',
        professorNote: 'Worst case happens when partition is maximally unbalanced every time — e.g., array already sorted and pivot chosen as last element (or first), giving partitions of sizes 0 and n-1 repeatedly. So deterministic pivot picking poorly can cause quadratic time.',
        bookReference: 'CLRS Chapter 7.2, Pages 175-177 - Worst-case Analysis'
      },
      {
        id: 'qs6',
        type: 'proof',
        title: '45:00–48:00 — Best-Case Time Complexity O(n log n)',
        content: `The best case occurs when partitioning splits the array as evenly as possible at each level.

BEST-CASE SCENARIO:
• Pivot is always the median (or near-median)
• Both partitions have approximately n/2 elements
• Recursion tree is balanced

RECURRENCE RELATION:
T(n) = 2T(n/2) + Θ(n)

SOLVING USING MASTER THEOREM:
Comparing to standard form: T(n) = aT(n/b) + f(n)
• a = 2 (two recursive calls)
• b = 2 (problem size halved)
• f(n) = Θ(n) (partition cost)

Check: n^(log_b(a)) = n^(log_2(2)) = n^1 = n

Since f(n) = Θ(n) = Θ(n^(log_b(a))), we apply Case 2 of Master Theorem:

T(n) = Θ(n^(log_b(a)) log n) = Θ(n log n)

CONCLUSION: Best-case time complexity is O(n log n).`,
        timestamp: '45:00–48:00',
        professorNote: 'Best case occurs when partition always splits array evenly (or near-even): sizes ≈ n/2 and n/2. Thus perfectly balanced splits yield Θ(n log n).',
        bookReference: 'CLRS Chapter 7.2, Pages 177-178 - Best-case Analysis'
      },
      {
        id: 'qs7',
        type: 'proof',
        title: '48:00–55:00 — Average-Case Expected Complexity O(n log n)',
        content: `We prove that QuickSort with random pivot selection has expected runtime Θ(n log n).

PROOF APPROACH: Use indicator random variables and linearity of expectation.

SETUP:
Let X_{i,j} be indicator variable for pair of elements (i,j) where i < j.
X_{i,j} = 1 if elements i and j are compared during execution, 0 otherwise.

Total comparisons C = Σ_{i<j} X_{i,j}

KEY INSIGHT: Elements i and j are compared if and only if one of them is chosen as pivot before any other element between them. Once a pivot between i and j is chosen, i and j end up in different partitions and never get compared.

PROBABILITY CALCULATION:
Consider all elements between positions i and j (inclusive): there are j-i+1 elements.
For i and j to be compared, either i or j must be selected as pivot first among these j-i+1 elements.

P(X_{i,j} = 1) = P(i or j chosen first) = 2/(j-i+1)

EXPECTED COMPARISONS:
E[C] = E[Σ_{i<j} X_{i,j}]
     = Σ_{i<j} E[X_{i,j}]           (linearity of expectation)
     = Σ_{i<j} P(X_{i,j} = 1)
     = Σ_{i<j} 2/(j-i+1)

Substituting k = j-i:
     = Σ_{k=1}^{n-1} (n-k) · 2/(k+1)
     = 2Σ_{k=1}^{n-1} (n-k)/(k+1)
     < 2n Σ_{k=1}^{n} 1/k
     = 2n H_n                        (H_n is nth harmonic number)
     = Θ(n log n)

CONCLUSION: Expected number of comparisons is Θ(n log n), and since each comparison takes constant time, expected runtime is Θ(n log n).`,
        timestamp: '48:00–55:00',
        professorNote: 'We prove expected runtime for QuickSort with random pivot selection is Θ(n log n). Hence expected comparisons—and therefore expected time—is Θ(n log n).',
        image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&h=600&fit=crop',
        imageCaption: 'Slide img23-4: Probability argument diagram showing interval and first pivot selection',
        animation: {
          id: 'anim-expected-case',
          title: 'Expected Case Analysis Visualization',
          description: 'Visual proof of the expected O(n log n) complexity using indicator variables and probability arguments. See how comparison probabilities are calculated.',
          thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=400&fit=crop',
          type: 'video'
        },
        bookReference: 'CLRS Chapter 7.4, Pages 180-184 - Randomized QuickSort Analysis'
      },
      {
        id: 'qs8',
        type: 'explanation',
        title: '55:00–58:00 — Practical Improvements & Optimizations',
        content: `In production implementations, several optimizations improve QuickSort's performance:

1. RANDOMIZED PIVOT SELECTION
   • Choose pivot uniformly at random
   • Makes worst-case O(n²) extremely unlikely
   • Expected performance O(n log n) regardless of input

2. MEDIAN-OF-THREE PIVOT
   • Choose median of first, middle, and last elements
   • Simple heuristic that often improves partition balance
   • Reduces likelihood of bad pivots

3. HYBRID APPROACH (Insertion Sort for Small Arrays)
   • Switch to insertion sort for subarrays ≤ 10-15 elements
   • Insertion sort is faster for tiny arrays (less overhead)
   • Reduces recursive call overhead

4. THREE-WAY PARTITIONING (Dutch National Flag)
   • Partition into: < pivot, = pivot, > pivot
   • Handles duplicate keys efficiently
   • Essential for arrays with many repeated values

5. TAIL RECURSION OPTIMIZATION
   • Recurse on smaller partition, loop on larger
   • Guarantees O(log n) stack depth
   • Prevents stack overflow on large inputs

6. IN-PLACE & CACHE-FRIENDLY
   • Operates directly on array (O(1) extra space for partition)
   • Good cache locality compared to MergeSort
   • Recursion requires O(log n) stack space on average

NOTE: Standard QuickSort is NOT stable (relative order of equal elements may change due to swaps).`,
        timestamp: '55:00–58:00',
        professorNote: 'In practice: Use randomized pivot (choose pivot at random) to make worst-case unlikely. Use median-of-three pivot selection. For small subarrays (e.g., ≤ 10), switch to insertion sort. QuickSort is in-place (Θ(log n) stack space) but not stable.',
        bookReference: 'CLRS Chapter 7.3, Pages 178-180 - Randomized Version; Sedgewick Chapter 2.3, Pages 296-298 - Improvements'
      },
      {
        id: 'qs9',
        type: 'concept',
        title: '58:00–60:00 — Summary & Key Takeaways',
        content: `QUICKSORT SUMMARY:

Algorithm Properties:
✓ Divide-and-conquer sorting algorithm
✓ In-place implementation (O(1) auxiliary space for partition)
✓ Recursive structure with linear partition operation
✓ Not stable (equal elements may be reordered)

Time Complexity:
• Best case: Θ(n log n) — balanced partitions
• Average case: Θ(n log n) — with random pivot
• Worst case: Θ(n²) — unbalanced partitions

Space Complexity:
• Auxiliary space: O(1) for partition
• Recursion depth: O(log n) average, O(n) worst

Practical Considerations:
• Widely used in practice due to good cache performance
• Faster than MergeSort in many real-world scenarios
• Requires careful pivot selection to avoid worst case
• Can be hybrid with other algorithms (Introsort)

When to Use QuickSort:
✓ Average performance is critical
✓ In-place sorting required (memory constrained)
✓ Stability not required
✓ Working with primitive types or random data

When to Avoid QuickSort:
✗ Worst-case O(n log n) guarantee needed → use MergeSort or HeapSort
✗ Stability required → use MergeSort
✗ Adversarial input patterns possible → use Introsort or randomized version`,
        timestamp: '58:00–60:00',
        professorNote: 'Recap — QuickSort average O(n log n), worst O(n²), in-place, recursive, widely used because of practical speed and cache friendliness; choose pivot carefully to avoid pathological cases.',
        bookReference: 'CLRS Chapter 7 Summary, Page 190'
      }
    ],
    doubts: [
      {
        id: 'doubt1',
        student: 'Student A',
        question: 'What happens when there are many equal elements? Will QuickSort degrade?',
        answer: 'If many equal elements and you use standard partition (which compares ≤ pivot), you may get poor performance or many swaps. Use three-way partitioning (Dutch National Flag) which partitions into < pivot, = pivot, > pivot in one pass. This reduces cost for many equal keys, often bringing run-time down close to linear in such degenerate distributions. Three-way partition QuickSort modifies Partition to track lt, eq, gt regions and recurses only on lt and gt. For arrays with many duplicates, expected runtime becomes O(n) for arrays where the number of distinct keys is small compared to n.',
        timestamp: '32:30'
      },
      {
        id: 'doubt2',
        student: 'Student B',
        question: 'Is QuickSort stable, and why or why not?',
        answer: 'Standard in-place QuickSort is not stable because swaps during partition can change the relative order of equal elements. If stability is required, either use a stable algorithm like MergeSort, or implement a stable QuickSort variant at the cost of extra memory (e.g., using extra arrays to collect <, =, > preserving order). However, stable QuickSort variants are rarely used in practice since MergeSort is simpler and guarantees O(n log n).',
        timestamp: '38:45'
      },
      {
        id: 'doubt3',
        student: 'Student C',
        question: 'How do we prove the expected number of comparisons more rigorously?',
        answer: 'The rigorous method uses indicator variables for each element-pair comparison and sums probabilities as I sketched. You can find the full step-by-step derivation in standard algorithms texts; it produces expected comparisons ≈ 2(n+1)H_n - 4n, which is Θ(n log n). The key insight is using linearity of expectation, which lets us sum individual probabilities without worrying about dependencies between comparisons.',
        timestamp: '52:15'
      },
      {
        id: 'doubt4',
        student: 'Student D',
        question: 'Why is QuickSort faster than MergeSort in practice despite same average time complexity?',
        answer: 'QuickSort\'s inner loops are very cache-friendly and work in-place, so constants are smaller and real-world performance is often better. MergeSort guarantees O(n log n) but requires extra memory and more copying overhead. In benchmarks, QuickSort often outperforms MergeSort on in-memory sorting due to locality and fewer data movements when implemented in-place with good pivot choice.',
        timestamp: '56:20'
      },
      {
        id: 'doubt5',
        student: 'Student E',
        question: 'How to avoid worst-case on adversarial inputs?',
        answer: 'Use randomized pivot or Introsort. Randomization ensures adversary can\'t force bad pivots deterministically. Introsort caps recursion depth and switches to HeapSort maintaining O(n log n) worst-case guarantee. For example, std::sort in C++ uses Introsort, which starts with QuickSort but switches to HeapSort if recursion depth exceeds 2⌊log n⌋ to prevent O(n²) behavior.',
        timestamp: '57:50'
      }
    ],
    examples: [
      {
        id: 'ex1',
        title: 'Complete QuickSort Trace on [10, 7, 8, 9, 1, 5]',
        problem: 'Trace the complete execution of QuickSort using Lomuto partition on the array [10, 7, 8, 9, 1, 5]. Show all recursive calls and partition operations.',
        solution: `INITIAL: A = [10, 7, 8, 9, 1, 5]

CALL 1: QuickSort(A, 0, 5)
Partition with pivot = 5 (last element)

i = -1, j iterates from 0 to 4:
j=0: A[0]=10 > 5 → no swap
j=1: A[1]=7 > 5 → no swap
j=2: A[2]=8 > 5 → no swap
j=3: A[3]=9 > 5 → no swap
j=4: A[4]=1 ≤ 5 → i=0, swap A[0]↔A[4] → [1,7,8,9,10,5]

Swap pivot: A[i+1=1] ↔ A[5] → [1,5,8,9,10,7]
Return p = 1

Array: [1 | 5 | 8,9,10,7]

CALL 2: QuickSort(A, 0, 0) — [1] already sorted ✓

CALL 3: QuickSort(A, 2, 5) — [8,9,10,7]
Partition with pivot = 7

i = 1, j iterates from 2 to 4:
j=2: A[2]=8 > 7 → no swap
j=3: A[3]=9 > 7 → no swap  
j=4: A[4]=10 > 7 → no swap

Swap pivot: A[i+1=2] ↔ A[5] → [1,5,7,9,10,8]
Return p = 2

Array: [1,5 | 7 | 9,10,8]

CALL 4: QuickSort(A, 2, 1) — empty range ✓

CALL 5: QuickSort(A, 3, 5) — [9,10,8]
Partition with pivot = 8

i = 2, j iterates from 3 to 4:
j=3: A[3]=9 > 8 → no swap
j=4: A[4]=10 > 8 → no swap

Swap pivot: A[i+1=3] ↔ A[5] → [1,5,7,8,10,9]
Return p = 3

Array: [1,5,7 | 8 | 10,9]

CALL 6: QuickSort(A, 3, 2) — empty range ✓

CALL 7: QuickSort(A, 4, 5) — [10,9]
Partition with pivot = 9

i = 3, j = 4:
j=4: A[4]=10 > 9 → no swap

Swap pivot: A[i+1=4] ↔ A[5] → [1,5,7,8,9,10]
Return p = 4

Array: [1,5,7,8 | 9 | 10]

CALL 8: QuickSort(A, 4, 3) — empty range ✓

CALL 9: QuickSort(A, 5, 5) — [10] already sorted ✓

FINAL RESULT: [1, 5, 7, 8, 9, 10] ✓`,
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop'
      },
      {
        id: 'ex2',
        title: 'Three-Way Partitioning Example',
        problem: 'Implement and trace three-way partition QuickSort on [4, 2, 4, 1, 4, 3, 4, 4, 2]',
        solution: `Three-way partition divides array into three regions: < pivot, = pivot, > pivot

ALGORITHM:
ThreeWayPartition(A, lo, hi):
    pivot = A[lo]
    lt = lo        # elements < pivot
    gt = hi        # elements > pivot
    i = lo + 1     # current position
    
    while i <= gt:
        if A[i] < pivot:
            swap A[lt] ↔ A[i]
            lt++; i++
        else if A[i] > pivot:
            swap A[i] ↔ A[gt]
            gt--
        else:  # A[i] == pivot
            i++
    
    return (lt, gt)  # boundaries of equal region

TRACE on [4, 2, 4, 1, 4, 3, 4, 4, 2]:

Initial: pivot = 4, lt = 0, gt = 8, i = 1

i=1: A[1]=2 < 4 → swap A[0]↔A[1] → [2,4,4,1,4,3,4,4,2], lt=1, i=2
i=2: A[2]=4 = 4 → i=3
i=3: A[3]=1 < 4 → swap A[1]↔A[3] → [2,1,4,4,4,3,4,4,2], lt=2, i=4
i=4: A[4]=4 = 4 → i=5
i=5: A[5]=3 < 4 → swap A[2]↔A[5] → [2,1,3,4,4,4,4,4,2], lt=3, i=6
i=6: A[6]=4 = 4 → i=7
i=7: A[7]=4 = 4 → i=8
i=8: A[8]=2 < 4 → swap A[3]↔A[8] → [2,1,3,2,4,4,4,4,4], lt=4, i=9

Final partitions:
[2,1,3,2] | [4,4,4,4,4] | []
   < 4         = 4         > 4

Only need to recursively sort [2,1,3,2]. The equal region is done!
This is much more efficient when there are many duplicates.`,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop'
      },
      {
        id: 'ex3',
        title: 'Worst-Case Demonstration: Sorted Array',
        problem: 'Show why QuickSort with last-element pivot has O(n²) time on sorted array [1,2,3,4,5]',
        solution: `On a sorted array with last-element pivot, every partition is maximally unbalanced:

A = [1,2,3,4,5]

Level 1: pivot=5, partition → [1,2,3,4] | [5] | []
         Work: 5 comparisons

Level 2: pivot=4, partition → [1,2,3] | [4] | []
         Work: 4 comparisons

Level 3: pivot=3, partition → [1,2] | [3] | []
         Work: 3 comparisons

Level 4: pivot=2, partition → [1] | [2] | []
         Work: 2 comparisons

Level 5: pivot=1, partition → [] | [1] | []
         Work: 1 comparison

Total comparisons: 5 + 4 + 3 + 2 + 1 = 15 = n(n+1)/2 = O(n²)

Recursion tree is completely unbalanced (like a linked list):
Depth = n-1 instead of log n

This demonstrates why:
1. Random pivot selection is crucial
2. Median-of-three helps avoid this scenario
3. Introsort switches to HeapSort if too many levels

With random pivot, probability of hitting worst case is negligible!`,
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=600&fit=crop'
      },
      {
        id: 'ex4',
        title: 'Expected Comparisons Calculation',
        problem: 'Calculate the expected number of comparisons for QuickSort on n=4 elements using the probability formula',
        solution: `For array of size n=4, we calculate E[C] = Σ P(i,j compared) for all pairs.

Recall: P(i compared to j) = 2/(j-i+1)

All pairs and their probabilities:
• (1,2): distance = 1 → P = 2/(1+1) = 1
• (1,3): distance = 2 → P = 2/(2+1) = 2/3
• (1,4): distance = 3 → P = 2/(3+1) = 1/2
• (2,3): distance = 1 → P = 2/(1+1) = 1
• (2,4): distance = 2 → P = 2/(2+1) = 2/3
• (3,4): distance = 1 → P = 2/(1+1) = 1

Expected comparisons:
E[C] = 1 + 2/3 + 1/2 + 1 + 2/3 + 1
     = 3 + 2·(2/3) + 1/2
     = 3 + 4/3 + 1/2
     = 18/6 + 8/6 + 3/6
     = 29/6
     ≈ 4.83 comparisons

General formula gives:
E[C] ≈ 2n ln n ≈ 2(4) ln 4 ≈ 11.09 (upper bound)

Our exact calculation shows ~4.83 comparisons average for n=4.

This demonstrates that the expected case is much better than worst case (which would be 1+2+3 = 6 comparisons for n=4 in unbalanced scenario).`,
        image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=1200&h=600&fit=crop'
      }
    ],
    animations: [
      {
        id: 'anim1',
        title: 'Interactive QuickSort Visualizer',
        description: 'Step through QuickSort execution on custom arrays. Watch partitions form, pivots get placed, and recursion unfold. Control speed and see comparison count in real-time.',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
        type: 'interactive'
      },
      {
        id: 'anim2',
        title: 'Complexity Comparison Animation',
        description: 'Visual comparison of QuickSort performance on best, average, and worst-case inputs. See how recursion tree depth changes with different pivot selections.',
        thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=400&fit=crop',
        type: 'video'
      },
      {
        id: 'anim3',
        title: 'Three-Way Partition Demonstration',
        description: 'Animated walkthrough of Dutch National Flag partitioning scheme showing how duplicate elements are handled efficiently in O(n) time.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop',
        type: 'interactive'
      }
    ]
  },
  'ic252-l3': {
    lectureId: 'ic252-l3',
    topic: 'Z-Transform and Its Applications',
    definition: 'The Z-transform is a mathematical tool used in signal processing to analyze discrete-time signals and systems. It converts a discrete-time signal from the time domain into a complex frequency domain representation, making it easier to analyze and manipulate digital signals.',
    recordingUrl: 'https://example.com/lecture-recording',
    bookReference: 'Digital Signal Processing by Oppenheim & Schafer - Chapter 3, Pages 145-178',
    content: [
      {
        id: 'c1',
        type: 'concept',
        title: 'Definition and Formula',
        content: 'The Z-transform of a discrete-time signal x[n] is defined as:\n\nX(z) = Σ(n=-∞ to ∞) x[n]z^(-n)\n\nwhere z is a complex variable. The region of convergence (ROC) is crucial for determining the uniqueness and properties of the Z-transform.',
        timestamp: '00:05:30'
      },
      {
        id: 'c2',
        type: 'explanation',
        title: 'Physical Interpretation',
        content: 'The professor explained that the Z-transform can be viewed as a generalization of the Fourier transform. When |z| = 1, the Z-transform reduces to the Discrete-Time Fourier Transform (DTFT). The complex variable z = re^(jω) allows us to analyze both the frequency content (ω) and the exponential growth/decay (r) of signals.',
        timestamp: '00:12:45'
      },
      {
        id: 'c3',
        type: 'proof',
        title: 'Linearity Property Proof',
        content: 'Theorem: If x₁[n] ↔ X₁(z) with ROC R₁ and x₂[n] ↔ X₂(z) with ROC R₂, then:\nax₁[n] + bx₂[n] ↔ aX₁(z) + bX₂(z) with ROC containing R₁ ∩ R₂\n\nProof:\nLet y[n] = ax₁[n] + bx₂[n]\nY(z) = Σ y[n]z^(-n)\n     = Σ [ax₁[n] + bx₂[n]]z^(-n)\n     = a·Σ x₁[n]z^(-n) + b·Σ x₂[n]z^(-n)\n     = aX₁(z) + bX₂(z)\n\nThe ROC is the intersection of R₁ and R₂, possibly extended.',
        timestamp: '00:25:10'
      },
      {
        id: 'c4',
        type: 'explanation',
        title: 'Applications in Filter Design',
        content: 'The Z-transform is fundamental in digital filter design. By expressing the transfer function H(z) = Y(z)/X(z) in the z-domain, we can analyze system stability (poles inside unit circle), design filters with desired frequency response, and implement efficient recursive algorithms.',
        timestamp: '00:42:20'
      }
    ],
    doubts: [
      {
        id: 'd1',
        student: 'Rahul M.',
        question: 'Sir, why do we need the Region of Convergence? Can\'t we just use the Z-transform formula directly?',
        answer: 'Excellent question! The ROC is crucial because different signals can have the same Z-transform formula but different ROCs. For example, both a causal and anti-causal exponential sequence have the same algebraic form, but different ROCs. The ROC tells us which signal we\'re actually dealing with and determines important properties like stability.',
        timestamp: '00:18:30'
      },
      {
        id: 'd2',
        student: 'Priya S.',
        question: 'How does the Z-transform relate to the Laplace transform we studied earlier?',
        answer: 'Great connection! The Z-transform is to discrete-time signals what the Laplace transform is to continuous-time signals. In fact, if you sample a continuous signal and apply the substitution z = e^(sT) where T is the sampling period, you can relate the two transforms. Both provide powerful frequency-domain analysis tools.',
        timestamp: '00:28:45'
      },
      {
        id: 'd3',
        student: 'Amit K.',
        question: 'Can we use Z-transform for non-causal systems?',
        answer: 'Absolutely! The Z-transform works for both causal and non-causal systems. The key difference shows up in the ROC. For causal systems, the ROC is typically outside a circle (|z| > r). For anti-causal systems, it\'s inside a circle (|z| < r). For two-sided sequences, the ROC is an annular region.',
        timestamp: '00:35:15'
      }
    ],
    examples: [
      {
        id: 'e1',
        title: 'Example 1: Z-Transform of Unit Step Function',
        problem: 'Find the Z-transform of the unit step sequence u[n] = {1 for n ≥ 0, 0 for n < 0}',
        solution: 'X(z) = Σ(n=0 to ∞) u[n]z^(-n)\n     = Σ(n=0 to ∞) z^(-n)\n     = 1 + z^(-1) + z^(-2) + z^(-3) + ...\n     \nThis is a geometric series with ratio z^(-1):\nX(z) = 1/(1 - z^(-1)) = z/(z-1)\n\nROC: |z| > 1 (the series converges when |z^(-1)| < 1)\n\nThe pole at z = 1 is outside the ROC for a causal system.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop'
      },
      {
        id: 'e2',
        title: 'Example 2: Z-Transform of Exponential Sequence',
        problem: 'Find the Z-transform of x[n] = a^n·u[n] where a is a constant',
        solution: 'X(z) = Σ(n=0 to ∞) a^n·z^(-n)\n     = Σ(n=0 to ∞) (a/z)^n\n     = 1/(1 - a/z)\n     = z/(z - a)\n\nROC: |z| > |a|\n\nThis is a fundamental transform pair used extensively in filter design. The pole at z = a determines the system\'s time constant and stability.',
        image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=400&fit=crop'
      },
      {
        id: 'e3',
        title: 'Example 3: Inverse Z-Transform using Partial Fractions',
        problem: 'Find the inverse Z-transform of X(z) = z²/((z-0.5)(z-0.8)) for |z| > 0.8',
        solution: 'Step 1: Divide by z for easier partial fraction decomposition:\nX(z)/z = z/((z-0.5)(z-0.8))\n\nStep 2: Partial fraction expansion:\nz/((z-0.5)(z-0.8)) = A/(z-0.5) + B/(z-0.8)\n\nSolving: A = 0.5/0.3 = 5/3, B = 0.8/(-0.3) = -8/3\n\nStep 3: Multiply back by z:\nX(z) = (5/3)·z/(z-0.5) - (8/3)·z/(z-0.8)\n\nStep 4: Inverse transform:\nx[n] = (5/3)·(0.5)^n·u[n] - (8/3)·(0.8)^n·u[n]\n\nThis is a causal sequence (due to ROC |z| > 0.8) that is the difference of two exponential sequences.',
        image: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800&h=400&fit=crop'
      }
    ],
    animations: [
      {
        id: 'a1',
        title: 'Z-Plane Visualization',
        description: 'Interactive visualization showing how poles and zeros in the z-plane affect the frequency response. Watch as poles move and see the corresponding changes in magnitude and phase response.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        type: 'interactive'
      },
      {
        id: 'a2',
        title: 'Region of Convergence Animation',
        description: 'Animated explanation of ROC for different types of signals - causal, anti-causal, and two-sided sequences. See how the ROC determines signal properties.',
        thumbnail: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop',
        type: 'video'
      },
      {
        id: 'a3',
        title: 'Z-Transform Properties Demonstration',
        description: 'Visual demonstration of key Z-transform properties including time-shifting, frequency scaling, and convolution theorem with step-by-step animations.',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
        type: 'video'
      }
    ]
  },
  'ic112-l3': {
    lectureId: 'ic112-l3',
    topic: 'Trees and Binary Search Trees',
    definition: 'A tree is a hierarchical data structure consisting of nodes connected by edges, with a single root node and no cycles. A Binary Search Tree (BST) is a special type of binary tree where each node has at most two children, and for every node, all values in the left subtree are smaller and all values in the right subtree are larger.',
    recordingUrl: 'https://example.com/lecture-recording-2',
    bookReference: 'Introduction to Algorithms (CLRS) - Chapter 12, Pages 286-320',
    content: [
      {
        id: 'c1',
        type: 'concept',
        title: 'Tree Terminology',
        content: 'Key terms in tree structures:\n\n• Root: The topmost node with no parent\n• Leaf: A node with no children\n• Height: The longest path from root to any leaf\n• Depth: Distance from root to a specific node\n• Subtree: A tree formed by a node and its descendants\n• Binary Tree: Each node has at most 2 children',
        timestamp: '00:03:20'
      },
      {
        id: 'c2',
        type: 'explanation',
        title: 'Binary Search Tree Property',
        content: 'The BST property is fundamental: For any node N with value V, all nodes in the left subtree have values < V, and all nodes in the right subtree have values > V. This property must hold recursively for every node in the tree. This ordering enables efficient searching, insertion, and deletion operations.',
        timestamp: '00:15:40'
      },
      {
        id: 'c3',
        type: 'proof',
        title: 'BST Search Complexity Proof',
        content: 'Theorem: In a balanced BST of height h, search takes O(h) time.\n\nProof:\nAt each step, we compare the target with current node and move to left or right child.\nSince we eliminate one subtree at each step, we traverse at most one path from root to leaf.\nThe maximum path length is the height h.\nTherefore, time complexity is O(h).\n\nFor a balanced BST with n nodes: h = log₂(n)\nThus, search time = O(log n)\n\nFor unbalanced BST (worst case): h = n\nThus, search time = O(n)',
        timestamp: '00:28:15'
      }
    ],
    doubts: [
      {
        id: 'd1',
        student: 'Sneha P.',
        question: 'What happens if we insert duplicate values in a BST?',
        answer: 'Good question! There are several approaches: 1) Reject duplicates entirely, 2) Allow duplicates in either left OR right subtree consistently, or 3) Keep a counter at each node. The choice depends on your application. Most implementations either reject duplicates or allow them in the right subtree.',
        timestamp: '00:22:10'
      },
      {
        id: 'd2',
        student: 'Arjun T.',
        question: 'Why do we need to balance a BST? Can\'t we just use a regular BST?',
        answer: 'Excellent observation! An unbalanced BST can degrade to a linked list in worst case (inserting sorted data), giving O(n) search time. Balanced BSTs like AVL or Red-Black trees maintain O(log n) height through rotations, guaranteeing O(log n) operations. The balancing overhead is worth it for large datasets.',
        timestamp: '00:35:30'
      }
    ],
    examples: [
      {
        id: 'e1',
        title: 'BST Insertion Algorithm',
        problem: 'Insert the sequence [50, 30, 70, 20, 40, 60, 80] into an empty BST',
        solution: 'Starting with empty tree:\n\nStep 1: Insert 50 (becomes root)\n        50\n\nStep 2: Insert 30 (30 < 50, go left)\n        50\n       /\n      30\n\nStep 3: Insert 70 (70 > 50, go right)\n        50\n       /  \\\n      30   70\n\nStep 4: Insert 20 (20 < 50, go left; 20 < 30, go left)\n        50\n       /  \\\n      30   70\n     /\n    20\n\nContinuing this process, final tree:\n        50\n       /  \\\n      30   70\n     / \\   / \\\n    20 40 60 80\n\nThis is a perfectly balanced BST with height 2.',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop'
      }
    ],
    animations: [
      {
        id: 'a1',
        title: 'BST Operations Visualizer',
        description: 'Step-by-step animation of insertion, deletion, and search operations in a Binary Search Tree. Watch how the tree structure changes dynamically.',
        thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
        type: 'interactive'
      },
      {
        id: 'a2',
        title: 'Tree Traversal Methods',
        description: 'Animated visualization of in-order, pre-order, and post-order traversals. See the order in which nodes are visited for each traversal method.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        type: 'video'
      }
    ]
  },
  'ic256-l4': {
    lectureId: 'ic256-l4',
    topic: 'Neural Networks Basics',
    definition: 'An artificial neural network is a computational model inspired by biological neural networks. It consists of interconnected nodes (neurons) organized in layers that process information using a connectionist approach to computation. Neural networks learn to perform tasks by considering examples without being explicitly programmed with task-specific rules.',
    recordingUrl: 'https://example.com/lecture-recording-3',
    bookReference: 'Deep Learning by Goodfellow, Bengio & Courville - Chapter 6, Pages 163-220',
    content: [
      {
        id: 'c1',
        type: 'concept',
        title: 'Perceptron Model',
        content: 'The perceptron is the fundamental building block of neural networks:\n\nOutput = activation(Σ(wᵢ·xᵢ) + b)\n\nwhere:\n• xᵢ are input features\n• wᵢ are weights (learned parameters)\n• b is the bias term\n• activation is a non-linear function (sigmoid, ReLU, tanh)\n\nThe perceptron computes a weighted sum of inputs and applies an activation function to produce an output.',
        timestamp: '00:08:15'
      },
      {
        id: 'c2',
        type: 'explanation',
        title: 'Multi-Layer Architecture',
        content: 'A neural network consists of:\n\n1. Input Layer: Receives raw features\n2. Hidden Layers: Perform transformations and learn representations\n3. Output Layer: Produces final predictions\n\nEach layer transforms data through matrix multiplication (W·x + b) followed by activation. Deep networks with multiple hidden layers can learn hierarchical representations, where early layers detect simple patterns and deeper layers combine them into complex features.',
        timestamp: '00:20:45'
      },
      {
        id: 'c3',
        type: 'explanation',
        title: 'Activation Functions',
        content: 'Common activation functions:\n\n• Sigmoid: σ(x) = 1/(1+e^(-x)) - outputs (0,1), used in output layer for binary classification\n• ReLU: f(x) = max(0,x) - most popular for hidden layers, solves vanishing gradient\n• Tanh: tanh(x) = (e^x - e^(-x))/(e^x + e^(-x)) - outputs (-1,1), zero-centered\n• Softmax: for multi-class classification in output layer\n\nActivation functions introduce non-linearity, allowing networks to learn complex patterns.',
        timestamp: '00:32:20'
      }
    ],
    doubts: [
      {
        id: 'd1',
        student: 'Karthik R.',
        question: 'Why do we need activation functions? Can\'t we just use linear transformations?',
        answer: 'Brilliant question! Without activation functions, stacking multiple layers is pointless - the composition of linear functions is still linear. No matter how deep your network, it would only learn linear relationships. Activation functions introduce non-linearity, enabling networks to approximate any complex function. This is why deep learning is so powerful!',
        timestamp: '00:25:30'
      },
      {
        id: 'd3',
        student: 'Divya M.',
        question: 'How do we decide the number of hidden layers and neurons?',
        answer: 'This is more art than science! General guidelines: Start simple and add complexity if needed. More neurons = more capacity but risk of overfitting. For most problems, 1-3 hidden layers work well. Use cross-validation to tune. Width vs depth: Deep narrow networks often work better than shallow wide ones for complex patterns. Modern practice: start with standard architectures proven for your task.',
        timestamp: '00:42:15'
      }
    ],
    examples: [
      {
        id: 'e1',
        title: 'Forward Pass Example',
        problem: 'Calculate the output of a simple neural network with one hidden layer for input x=[2, 3]',
        solution: 'Network architecture:\n• Input: 2 neurons\n• Hidden: 3 neurons (ReLU activation)\n• Output: 1 neuron (sigmoid)\n\nGiven weights and biases:\nW1 = [[0.5, 0.3], [0.2, 0.8], [0.6, 0.1]]\nb1 = [0.1, 0.2, 0.3]\nW2 = [[0.4], [0.7], [0.2]]\nb2 = [0.5]\n\nStep 1: Hidden layer computation\nh = ReLU(W1·x + b1)\n  = ReLU([[0.5, 0.3], [0.2, 0.8], [0.6, 0.1]]·[2, 3] + [0.1, 0.2, 0.3])\n  = ReLU([1.9, 2.8, 1.8])\n  = [1.9, 2.8, 1.8]\n\nStep 2: Output layer\ny = sigmoid(W2·h + b2)\n  = sigmoid([0.4, 0.7, 0.2]·[1.9, 2.8, 1.8] + 0.5)\n  = sigmoid(3.59)\n  ≈ 0.973\n\nFinal output: 0.973 (high probability for positive class)',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop'
      }
    ],
    animations: [
      {
        id: 'a1',
        title: 'Neural Network Playground',
        description: 'Interactive visualization of how neural networks learn decision boundaries. Adjust layers, neurons, and activation functions to see real-time training on various datasets.',
        thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
        type: 'interactive'
      },
      {
        id: 'a2',
        title: 'Activation Functions Compared',
        description: 'Visual comparison of different activation functions showing their shapes, gradients, and effects on network learning. Understand why ReLU became the default choice.',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
        type: 'video'
      },
      {
        id: 'a3',
        title: 'Forward Propagation Animation',
        description: 'Step-by-step animation showing how data flows through a neural network from input to output, with matrix multiplications and activations visualized at each layer.',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        type: 'video'
      }
    ]
  }
};