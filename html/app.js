let selectedIdentity = null
let selectedIdentityType = null
let selectedIdentityCost = null
let selectedJob = null
let selectedJobId = null

const jobDescriptions = {
  trucker: "Drive trucks and deliver goods across the city.",
  taxi: "Transport passengers to their destinations.",
  tow: "Assist in removing illegally parked or disabled vehicles.",
  reporter: "Gather and report news for the local media.",
  garbage: "Collect and dispose of waste to keep the city clean.",
  bus: "Operate public transportation buses on designated routes.",
  hotdog: "Run a hot dog stand and serve delicious street food.",
}

const Open = (jobs) => {
  SetJobs(jobs)
  $(".container").fadeIn(300).addClass("fade-in")
}

const Close = () => {
  $(".container").fadeOut(300, () => {
    ResetPages()
  })
  $.post("https://qb-cityhall/close")
  $(selectedJob).removeClass("job-selected")
  $(selectedIdentity).removeClass("identity-selected")
}

const SetJobs = (jobs) => {
  $(".job-page-blocks").empty()
  $.each(jobs, (job, info) => {
    const description = jobDescriptions[job] || "No description available."
    const html = `
            <div class="job-page-block slide-in" data-job="${job}">
                <h3>${info.label}</h3>
                <p>${description}</p>
            </div>`
    $(".job-page-blocks").append(html)
  })
}

const ResetPages = () => {
  $(".cityhall-identity-page, .cityhall-job-page").addClass("fade-out")
  setTimeout(() => {
    $(".cityhall-identity-page, .cityhall-job-page").hide()
    $(".cityhall-option-blocks").removeClass("fade-out slide-out").addClass("fade-in")
    $(".cityhall-option-blocks").show()
    $(".request-identity-button, .apply-job-button").hide()
  }, 300)
}

$(document).ready(() => {
  window.addEventListener("message", (event) => {
    switch (event.data.action) {
      case "open":
        Open(event.data.jobs)
        break
      case "close":
        Close()
        break
      case "setJobs":
        SetJobs(event.data.jobs)
        break
    }
  })
})

$(document).on("keydown", (event) => {
  if (event.keyCode === 27) {
    // ESC
    Close()
  }
})

$(".cityhall-option-block").click(function (e) {
  e.preventDefault()
  const blockPage = $(this).data("page")
  $(".cityhall-option-blocks").addClass("fade-out slide-out")
  setTimeout(() => {
    $(".cityhall-option-blocks").hide()
    $(`.cityhall-${blockPage}-page`).removeClass("fade-out").addClass("fade-in").show()
  }, 300)
  if (blockPage === "identity") {
    $(".identity-page-blocks").html("")
    $.post("https://qb-cityhall/requestLicenses", JSON.stringify({}), (licenses) => {
      $.each(licenses, (i, license) => {
        const elem = `
                        <div class="identity-page-block slide-in" data-type="${i}" data-cost="${license.cost}">
                            <h3>${license.label}</h3>
                            <p>Cost: $${license.cost}</p>
                        </div>`
        $(".identity-page-blocks").append(elem)
      })
    })
  }
  $(".back-to-main").show()
})

$(document).on("click", ".identity-page-block", function (e) {
  e.preventDefault()
  selectedIdentityType = $(this).data("type")
  selectedIdentityCost = $(this).data("cost")
  if (selectedIdentity === null) {
    $(this).addClass("identity-selected")
    selectedIdentity = this
    $(".request-identity-button").html(`Buy $${selectedIdentityCost}`).fadeIn(300)
  } else if (selectedIdentity === this) {
    $(this).removeClass("identity-selected")
    selectedIdentity = null
    $(".request-identity-button").fadeOut(300)
  } else {
    $(selectedIdentity).removeClass("identity-selected")
    $(this).addClass("identity-selected")
    selectedIdentity = this
    $(".request-identity-button").html(`Buy $${selectedIdentityCost}`).fadeIn(300)
  }
})

$(".request-identity-button").click((e) => {
  e.preventDefault()
  $.post(
    "https://qb-cityhall/requestId",
    JSON.stringify({
      type: selectedIdentityType,
      cost: selectedIdentityCost,
    }),
  )
  ResetPages()
})

$(document).on("click", ".job-page-block", function (e) {
  e.preventDefault()
  selectedJobId = $(this).data("job")
  if (selectedJob === null) {
    $(this).addClass("job-selected")
    selectedJob = this
    $(".apply-job-button").fadeIn(300)
  } else if (selectedJob === this) {
    $(this).removeClass("job-selected")
    selectedJob = null
    $(".apply-job-button").fadeOut(300)
  } else {
    $(selectedJob).removeClass("job-selected")
    $(this).addClass("job-selected")
    selectedJob = this
  }
})

$(".apply-job-button").click((e) => {
  e.preventDefault()
  $.post("https://qb-cityhall/applyJob", JSON.stringify(selectedJobId))
  ResetPages()
})

$(".back-to-main").click((e) => {
  e.preventDefault()
  $(selectedJob).removeClass("job-selected")
  $(selectedIdentity).removeClass("identity-selected")
  ResetPages()
})

