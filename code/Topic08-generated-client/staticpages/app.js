/* =========================================================================
   Books Manager — jQuery AJAX CRUD (id, title, author, price)
   API base set to http://localhost:5000
   ========================================================================= */

const API_BASE_URL = "http://localhost:5000";
const ENDPOINT = "/books";
const AUTH_TOKEN = ""; // if needed, set to your bearer token

// ------------------------------ Utilities ---------------------------------

function showLoading(show = true) {
  console.log("[UI] showLoading:", show);
  $("#loading").toggleClass("hidden", !show);
}

let toastTimer = null;
function showToast(message, type = "success", timeoutMs = 2400) {
  console.log("[UI] showToast:", type, message);
  const $toast = $("#toast");
  $toast.removeClass("hidden success error").addClass(type).text(message);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.addClass("hidden"), timeoutMs);
}

/**
 * AJAX helper using jQuery
 * @param {string} method - GET | POST | PUT | DELETE
 * @param {string} path - path after base URL (e.g., '/books' or '/books/1')
 * @param {object|undefined} data - request body object
 * @returns {Promise<any>}
 */
function api(method, path, data) {
  const url = API_BASE_URL.replace(/\/+$/, "") + path;
  console.log(`[API] ${method} ${url}`, data ?? "");
  return $.ajax({
    url,
    method,
    crossDomain: true,
    contentType: data ? "application/json; charset=utf-8" : undefined,
    dataType: "json",
    data: data ? JSON.stringify(data) : undefined,
    headers: AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {},
  })
    .done((res, status, xhr) => {
      console.log(`[API DONE] ${method} ${url}`, { status, res, xhr });
    })
    .fail((xhr, status, err) => {
      console.error(`[API FAIL] ${method} ${url}`, { status, err, xhr });
    });
}

/** Escape text for safe insertion — robust across browsers */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return num.toFixed(2);
}

// ------------------------------ State -------------------------------------

let allBooks = [];  // cached list (for client-side search)

// ------------------------------ Rendering ---------------------------------

function renderBooks(books) {
  console.log("[Render] start with books:", books);

  const $tbody = $("#booksTbody");
  if ($tbody.length === 0) {
    console.error("[Render] #booksTbody NOT FOUND in DOM!");
    return;
  }

  $tbody.empty();

  if (!Array.isArray(books)) {
    console.error("[Render] Expected array, got:", books);
    $("#countBadge").text("0");
    $tbody.append(`<tr><td colspan="5" style="color:#9aa4b2;">Invalid data.</td></tr>`);
    console.log("[Render] appended invalid data row");
    return;
  }

  if (books.length === 0) {
    $tbody.append(`<tr><td colspan="5" style="color:#9aa4b2;">No books found.</td></tr>`);
    $("#countBadge").text("0");
    console.log("[Render] appended 'No books' row");
    return;
  }

  let rowsHtml = "";
  for (const b of books) {
    rowsHtml +=
      `<tr data-id="${escapeHtml(b.id)}">` +
        `<td>${escapeHtml(b.id)}</td>` +
        `<td>${escapeHtml(b.title)}</td>` +
        `<td>${escapeHtml(b.author)}</td>` +
        `<td>€ ${formatPrice(b.price)}</td>` +
        `<td>` +
          `<div class="row-actions">` +
            `<button class="btn btn-secondary btn-edit">Edit</button>` +
            `<button class="btn btn" style="border-color:#33222a;background:#1b1014;color:#fca5a5" title="Delete">Delete</button>` +
          `</div>` +
        `</td>` +
      `</tr>`;
  }

  console.log("[Render] built rowsHtml length:", rowsHtml.length);
  $tbody.html(rowsHtml);
  $("#countBadge").text(String(books.length));
  console.log("[Render] done. Rows now in DOM:", $("#booksTbody tr").length);
}

// ------------------------------ Validation --------------------------------

function clearErrors() {
  $(".error").text("");
}

function setError(name, message) {
  $(`.error[data-for="${name}"]`).text(message || "");
}

function validateForm(formData) {
  let ok = true;
  clearErrors();

  if (!formData.title || !formData.title.trim()) {
    setError("title", "Title is required");
    ok = false;
  }
  if (!formData.author || !formData.author.trim()) {
    setError("author", "Author is required");
    ok = false;
  }
  if (formData.price === "" || formData.price === null || formData.price === undefined) {
    setError("price", "Price is required");
    ok = false;
  } else {
    const p = Number(formData.price);
    if (!Number.isFinite(p) || p < 0) {
      setError("price", "Price must be a non-negative number");
      ok = false;
    }
  }
  return ok;
}

// ------------------------------ CRUD Calls --------------------------------

async function loadBooks() {
  console.log("[Load] loadBooks() called");
  showLoading(true);
  try {
    const data = await api("GET", ENDPOINT); // Expect: array of books
    console.log("[Load] GET /books response:", data, "Array?", Array.isArray(data));
    if (Array.isArray(data)) {
      allBooks = data;
      renderBooks(allBooks); // render EXACTLY what server returns
    } else {
      showToast("Unexpected response from server.", "error");
      renderBooks([]); // show 'No books' row to avoid blank state
    }
  } catch (err) {
    console.error("[Load] GET /books threw error:", err);
    showToast("Failed to load books.", "error");
    renderBooks([]); // show 'No books' row
  } finally {
    showLoading(false);
    console.log("[Load] loadBooks() finished");
  }
}

async function createBook(payload) {
  console.log("[Create] payload:", payload);
  showLoading(true);
  try {
    const created = await api("POST", ENDPOINT, payload);
    console.log("[Create] created:", created);
    showToast("Book created.", "success");
    allBooks.push(created);
    renderBooks(allBooks);
    // Reset form
    $("#bookForm")[0].reset();
    $("#bookId").val("");
    $("#formTitle").text("Add a New Book");
    $("#submitBtn").text("Create");
    clearErrors();
  } catch (err) {
    console.error("[Create] failed:", err);
    showToast("Failed to create book.", "error");
  } finally {
    showLoading(false);
  }
}

async function updateBook(id, payload) {
  console.log("[Update] id:", id, "payload:", payload);
  showLoading(true);
  try {
    const updated = await api("PUT", `${ENDPOINT}/${encodeURIComponent(id)}`, payload);
    console.log("[Update] updated:", updated);
    showToast("Book updated.", "success");
    const idx = allBooks.findIndex(b => String(b.id) === String(id));
    if (idx !== -1) allBooks[idx] = updated;
    renderBooks(allBooks);
    // Reset form
    $("#bookForm")[0].reset();
    $("#bookId").val("");
    $("#formTitle").text("Add a New Book");
    $("#submitBtn").text("Create");
    clearErrors();
  } catch (err) {
    console.error("[Update] failed:", err);
    showToast("Failed to update book.", "error");
  } finally {
    showLoading(false);
  }
}

async function deleteBook(id) {
  console.log("[Delete] id:", id);
  showLoading(true);
  try {
    await api("DELETE", `${ENDPOINT}/${encodeURIComponent(id)}`);
    showToast("Book deleted.", "success");
    allBooks = allBooks.filter(b => String(b.id) !== String(id));
    renderBooks(allBooks);
  } catch (err) {
    console.error("[Delete] failed:", err);
    showToast("Failed to delete book.", "error");
  } finally {
    showLoading(false);
  }
}

async function getBook(id) {
  console.log("[GetOne] id:", id);
  showLoading(true);
  try {
    const book = await api("GET", `${ENDPOINT}/${encodeURIComponent(id)}`);
    console.log("[GetOne] book:", book);
    return book;
  } catch (err) {
    console.error("[GetOne] failed:", err);
    showToast("Failed to fetch book.", "error");
    return null;
  } finally {
    showLoading(false);
  }
}

// ------------------------------ Events ------------------------------------

$(document).ready(function() {
  console.log("[DOM] document.ready — initializing handlers and loading books");

  // Fetch & display books on page load (no initial filter)
  loadBooks();

  // Refresh button
  $("#refreshBtn").on("click", () => {
    console.log("[UI] Refresh clicked");
    loadBooks();
  });

  // Search/filter (applies only to already-fetched list)
  $("#searchInput").on("input", function() {
    const q = $(this).val();
    console.log("[UI] Search input:", q);
    const filtered = !q ? allBooks : allBooks.filter(b =>
      (b.title || "").toLowerCase().includes(q.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(q.toLowerCase())
    );
    renderBooks(filtered);
  });
  $("#clearSearchBtn").on("click", function() {
    console.log("[UI] Clear search clicked");
    $("#searchInput").val("");
    renderBooks(allBooks);
  });

  // Form submit (create/update)
  $("#bookForm").on("submit", async function(e) {
    e.preventDefault();

    const formData = {
      title: $("#title").val(),
      author: $("#author").val(),
      price: $("#price").val(),
    };
    console.log("[Form] submit formData:", formData);

    // Validate
    const isValid = (function validateForm(fd) {
      let ok = true;
      $(".error").text("");

      if (!fd.title || !fd.title.trim()) {
        $(`.error[data-for="title"]`).text("Title is required");
        ok = false;
      }
      if (!fd.author || !fd.author.trim()) {
        $(`.error[data-for="author"]`).text("Author is required");
        ok = false;
      }
      if (fd.price === "" || fd.price === null || fd.price === undefined) {
        $(`.error[data-for="price"]`).text("Price is required");
        ok = false;
      } else {
        const p = Number(fd.price);
        if (!Number.isFinite(p) || p < 0) {
          $(`.error[data-for="price"]`).text("Price must be a non-negative number");
          ok = false;
        }
      }
      console.log("[Form] validation ok?", ok);
      return ok;
    })(formData);

    if (!isValid) return;

    const id = $("#bookId").val();
    const payload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      price: Number(formData.price),
    };

    if (id) {
      await updateBook(id, payload);
    } else {
      await createBook(payload);
    }
  });

  // Reset form
  $("#resetBtn").on("click", function() {
    console.log("[UI] Reset clicked");
    $("#bookForm")[0].reset();
    $("#bookId").val("");
    $("#formTitle").text("Add a New Book");
    $("#submitBtn").text("Create");
    $(".error").text("");
  });

  // Row actions: Edit
  $("#booksTbody").on("click", ".btn-edit", async function() {
    const id = $(this).closest("tr").data("id");
    console.log("[UI] Edit clicked for id:", id);
    const book = await getBook(id);
    if (book) {
      $("#bookId").val(book.id ?? "");
      $("#title").val(book.title ?? "");
      $("#author").val(book.author ?? "");
      $("#price").val(book.price ?? "");
      $("#formTitle").text("Edit Book");
      $("#submitBtn").text("Update");
      $(".error").text("");
    }
  });

  // Row actions: Delete
  $("#booksTbody").on("click", ".row-actions .btn", function() {
    const $btn = $(this);
    if ($btn.hasClass("btn-edit")) return; // handled above
    const id = $btn.closest("tr").data("id");
    console.log("[UI] Delete clicked for id:", id);
    if (!id) return;
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBook(id);
    }
  });
});