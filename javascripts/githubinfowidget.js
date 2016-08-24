(function($) {
  function widget(element, options, callback) {
    this.element = element, this.options = options, this.callback = $.isFunction(callback) ? callback : $.noop
  }
  widget.prototype = function() {
    function getCommits(user, repo, branch, callback) {
      $.ajax({
        url: "https://api.github.com/repos/" + user + "/" + repo + "/commits?sha=" + branch,
        dataType: "jsonp",
        success: callback
      })
    }

    function _widgetRun(widget) {
      if (!widget.options) return widget.element.append('<span class="error">Options for widget are not set.</span>'), void 0;
      var callback = widget.callback,
          element = widget.element,
          user = widget.options.user,
          repo = widget.options.repo,
          branch = widget.options.branch,
          last = void 0 === widget.options.last ? 0 : widget.options.last,
            limitMessage = void 0 === widget.options.limitMessageTo ? 0 : widget.options.limitMessageTo
            element.append("<p>Widget intitalization, please wait...</p>"), getCommits(user, repo, branch, function(data) {
              function itemClass(current, totalCommits) {
                return 0 === current ? 'class="first"' : current === totalCommits - 1 ? 'class="last"' : ""
              }

              function avatar(user) {
                return '<img class="github-avatar" src="'+user.avatar_url+'"/>'
              }

              function author(login) {
                return '<a class="github-user" href="https://github.com/' + login + '">' + login + "</a>"
              }

              function message(commitMessage, sha) {
                var originalCommitMessage = commitMessage;
                return limitMessage > 0 && commitMessage.length > limitMessage && (commitMessage = commitMessage.substr(0, limitMessage) + "..."), '"<a class="github-commit" title="' + originalCommitMessage + '" href="https://github.com/' + user + "/" + repo + "/commit/" + sha + '">' + commitMessage + '</a>"'
              }

              function replaceHtmlTags(message) {
                return message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
              }

              function when(commitDate) {
                var commitTime = new Date(commitDate).getTime(),
                    todayTime = (new Date).getTime(),
                    differenceInDays = Math.floor((todayTime - commitTime) / 864e5);
                if (0 === differenceInDays) {
                  var differenceInHours = Math.floor((todayTime - commitTime) / 36e5);
                  if (0 === differenceInHours) {
                    var differenceInMinutes = Math.floor((todayTime - commitTime) / 6e5);
                    return 0 === differenceInMinutes ? "just now" : "about " + differenceInMinutes + " minutes ago"
                  }
                  return "about " + differenceInHours + " hours ago"
                }
                return 1 == differenceInDays ? "yesterday" : differenceInDays + " days ago"
              }
              var commits = data.data,
                  totalCommits = commits.length > last ? last : commits.length;
              element.empty();
              for (var list = $('<ul class="github-commits-list">').appendTo(element), c = 0; totalCommits > c; c++) {
                var commit = commits[c];
                list.append("<li " + itemClass(c, totalCommits) + " >" + " " + (null !== commit.author ? avatar(commit.author) : "") + " " + (null !== commit.author ? author(commit.author.login) : commit.commit.committer.name) + " committed " + message(replaceHtmlTags(commit.commit.message), commit.sha) + " " + when(commit.commit.committer.date) + "</li>")
              }
              callback(element)
            })
    }
    return {
      run: function() {
        _widgetRun(this)
      }
    }
  }(), $.fn.githubInfoWidget = function(options, callback) {
    return this.each(function() {
      new widget($(this), options, callback).run()
    }), this
  }
})(jQuery);
