from bookapidao import getAllBooks

books = getAllBooks()
total = 0
count = 0
for book in books:
    total += book["price"]
    count += 1

    
# or if you want to be fancier
# total = sum(book["price"] for book in books)
# count = len(books)

print ("average of ", count, "books is ", total/count )